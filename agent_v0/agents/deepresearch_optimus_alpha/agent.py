import os
import sys
import json
from dotenv import load_dotenv
from openai import OpenAI

# Add the parent directory to sys.path to make imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Import from the local directory
from agents.deepresearch_optimus_alpha.config import Configuration
from agents.deepresearch_optimus_alpha.state import Section, Sections, SearchQuery, Queries, Feedback
from agents.deepresearch_optimus_alpha.prompts import *
from agents.deepresearch_optimus_alpha.utils import get_config_value, get_search_params, format_sections, smart_search

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY not found in environment variables.")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

def call_llm(messages, model="openrouter/optimus-alpha", extra_headers=None):
    completion = client.chat.completions.create(
        extra_headers=extra_headers or {},
        extra_body={},
        model=model,
        messages=messages
    )
    return completion.choices[0].message.content

def parse_sections_from_llm_output(sections_text):
    try:
        # Find JSON content in the response
        start = sections_text.find('{')
        end = sections_text.rfind('}') + 1
        if start == -1 or end == 0:
            # If no JSON found, try to parse as a list of sections
            lines = sections_text.strip().split('\n')
            sections = []
            for line in lines:
                if line.strip():
                    sections.append({
                        "name": line.strip(),
                        "description": "Auto-generated section",
                        "research": True,
                        "content": ""
                    })
            return sections
        
        json_str = sections_text[start:end]
        data = json.loads(json_str)
        return data.get("sections", [])
    except Exception as e:
        print(f"Failed to parse sections from LLM output: {e}")
        # Return a default section if parsing fails
        return [{
            "name": "Research Report",
            "description": "Generated research on the topic",
            "research": True,
            "content": ""
        }]

def generate_report_plan(topic, config, memory=None):
    system_instructions_query = report_planner_query_writer_instructions.format(
        topic=topic,
        report_organization=config.report_structure,
        number_of_queries=config.number_of_queries
    )
    query_messages = memory[:] if memory else []
    query_messages += [
        {"role": "system", "content": system_instructions_query},
        {"role": "user", "content": "Generate search queries that will help with planning the sections of the report."}
    ]
    queries_text = call_llm(query_messages)
    queries = [q.strip() for q in queries_text.split("\n") if q.strip()]
    
    source_str = smart_search(queries)
    
    system_instructions_sections = report_planner_instructions.format(
        topic=topic,
        report_organization=config.report_structure,
        context=source_str,
        feedback=""
    )
    planner_message = "Generate the sections of the report. Your response must include a 'sections' field containing a list of sections. Each section must have: name, description, research, and content fields."
    section_messages = memory[:] if memory else []
    section_messages += [
        {"role": "system", "content": system_instructions_sections},
        {"role": "user", "content": planner_message}
    ]
    sections_text = call_llm(section_messages)
    sections = parse_sections_from_llm_output(sections_text)
    return sections, memory

def generate_section_queries(topic, section, config, memory=None):
    system_instructions = query_writer_instructions.format(
        topic=topic,
        section_topic=section["description"],
        number_of_queries=config.number_of_queries
    )
    messages = memory[:] if memory else []
    messages += [
        {"role": "system", "content": system_instructions},
        {"role": "user", "content": "Generate search queries on the provided topic."}
    ]
    queries_text = call_llm(messages)
    return [q.strip() for q in queries_text.split("\n") if q.strip()], messages

def write_section(topic, section, source_str, memory=None):
    section_writer_inputs_formatted = section_writer_inputs.format(
        topic=topic,
        section_name=section["name"],
        section_topic=section["description"],
        context=source_str,
        section_content=section.get("content", "")
    )
    messages = memory[:] if memory else []
    messages += [
        {"role": "system", "content": section_writer_instructions},
        {"role": "user", "content": section_writer_inputs_formatted}
    ]
    content = call_llm(messages)
    return content, messages

def grade_section(topic, section, config, memory=None):
    section_grader_instructions_formatted = section_grader_instructions.format(
        topic=topic,
        section_topic=section["description"],
        section=section["content"],
        number_of_follow_up_queries=config.number_of_queries
    )
    section_grader_message = (
        "Grade the report and consider follow-up questions for missing information. "
        "If the grade is 'pass', return empty strings for all follow-up queries. "
        "If the grade is 'fail', provide specific search queries to gather missing information."
    )
    messages = memory[:] if memory else []
    messages += [
        {"role": "system", "content": section_grader_instructions_formatted},
        {"role": "user", "content": section_grader_message}
    ]
    try:
        output = call_llm(messages)
        # Try to extract JSON
        start = output.find('{')
        end = output.rfind('}') + 1
        if start >= 0 and end > 0:
            feedback = json.loads(output[start:end])
        else:
            # If no JSON found, default to pass
            feedback = {"grade": "pass", "follow_up_queries": []}
    except Exception as e:
        print(f"Failed to parse grading feedback: {e}")
        feedback = {"grade": "pass", "follow_up_queries": []}
    return feedback, messages

def write_final_section(topic, section, completed_report_sections, memory=None):
    system_instructions = final_section_writer_instructions.format(
        topic=topic,
        section_name=section["name"],
        section_topic=section["description"],
        context=completed_report_sections
    )
    messages = memory[:] if memory else []
    messages += [
        {"role": "system", "content": system_instructions},
        {"role": "user", "content": "Generate a report section based on the provided sources."}
    ]
    content = call_llm(messages)
    return content, messages

def chat_agent(chat_history, query):
    """Entry point for the meta agent"""
    config = Configuration()
    memory = chat_history.copy() if chat_history else []
    memory.append({"role": "user", "content": query})
    
    # Run the research workflow
    sections, memory = generate_report_plan(query, config, memory)
    completed_sections = []
    
    # Process research-required sections
    for section in sections:
        if section.get("research", False):
            search_iterations = 0
            max_depth = config.max_search_depth
            
            while search_iterations < max_depth:
                queries, memory = generate_section_queries(query, section, config, memory)
                sources = smart_search(queries)
                content, memory = write_section(query, section, sources, memory)
                section["content"] = content
                feedback, memory = grade_section(query, section, config, memory)
                
                if feedback.get("grade") == "pass":
                    break
                else:
                    queries = [q["search_query"] if isinstance(q, dict) and "search_query" in q else q 
                              for q in feedback.get("follow_up_queries", [])]
                search_iterations += 1
            completed_sections.append(section)
    
    # Process non-research sections
    completed_content = format_sections(completed_sections)
    for section in sections:
        if not section.get("research", False):
            content, memory = write_final_section(query, section, completed_content, memory)
            section["content"] = content
            completed_sections.append(section)
    
    # Generate final report
    report = "\n\n".join([s.get("content", "") for s in sections])
    
    # Update chat history
    memory.append({"role": "assistant", "content": report})
    return report, memory
