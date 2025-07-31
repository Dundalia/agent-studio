import os
from typing import Optional, Dict, Any, List

def get_config_value(value):
    return value if isinstance(value, str) else value.value

def get_search_params(search_api: str, search_api_config: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    SEARCH_API_PARAMS = {
        "tavily": [],
        "duckduckgo": [],
    }
    accepted_params = SEARCH_API_PARAMS.get(search_api, [])
    if not search_api_config:
        return {}
    return {k: v for k, v in search_api_config.items() if k in accepted_params}

def format_sections(sections: list) -> str:
    """
    Format a list of sections (as dicts or objects) into a string.
    """
    formatted_str = ""
    for idx, section in enumerate(sections, 1):
        name = section["name"] if isinstance(section, dict) else section.name
        description = section["description"] if isinstance(section, dict) else section.description
        research = section["research"] if isinstance(section, dict) else section.research
        content = section.get("content", "") if isinstance(section, dict) else getattr(section, "content", "")
        formatted_str += f"""
{'='*60}
Section {idx}: {name}
{'='*60}
Description:
{description}
Requires Research: 
{research}

Content:
{content if content else '[Not yet written]'}

"""
    return formatted_str

# --- Search logic as before ---

try:
    import requests
    TAVILY_AVAILABLE = True
except ImportError:
    TAVILY_AVAILABLE = False

try:
    from duckduckgo_search import DDGS
    from duckduckgo_search.exceptions import DuckDuckGoSearchException
    DUCKDUCKGO_AVAILABLE = True
except ImportError:
    DUCKDUCKGO_AVAILABLE = False

def tavily_search(queries: List[str], max_results: int = 5) -> str:
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return "[Tavily API key not found. Please add TAVILY_API_KEY to your .env file.]"
    results = []
    for query in queries:
        try:
            response = requests.post(
                "https://api.tavily.com/search",
                json={"api_key": api_key, "query": query, "max_results": max_results, "include_answer": False},
                timeout=15
            )
            response.raise_for_status()
            data = response.json()
            for res in data.get("results", []):
                results.append({
                    "query": query,
                    "title": res.get("title", ""),
                    "url": res.get("url", ""),
                    "content": res.get("content", "")
                })
        except Exception as e:
            results.append({
                "query": query,
                "title": "[Tavily Error]",
                "url": "",
                "content": f"Error: {e}"
            })
    formatted = ""
    for i, res in enumerate(results, 1):
        formatted += f"{'='*80}\n"
        formatted += f"Query: {res['query']}\nTitle: {res['title']}\nURL: {res['url']}\nContent: {res['content']}\n"
        formatted += f"{'='*80}\n\n"
    return formatted

def duckduckgo_search(queries: List[str], max_results: int = 5) -> str:
    if not DUCKDUCKGO_AVAILABLE:
        return "[duckduckgo_search package not installed.]"
    ddgs = DDGS()
    results = []
    for query in queries:
        try:
            search_results = ddgs.text(query, max_results=max_results)
            for res in search_results:
                results.append({
                    "query": query,
                    "title": res.get("title", ""),
                    "url": res.get("href", ""),
                    "content": res.get("body", "")
                })
        except DuckDuckGoSearchException as e:
            results.append({
                "query": query,
                "title": "[DuckDuckGo Rate Limited]",
                "url": "",
                "content": f"Rate limit or error: {e}"
            })
    formatted = ""
    for i, res in enumerate(results, 1):
        formatted += f"{'='*80}\n"
        formatted += f"Query: {res['query']}\nTitle: {res['title']}\nURL: {res['url']}\nContent: {res['content']}\n"
        formatted += f"{'='*80}\n\n"
    return formatted

def smart_search(queries: List[str], max_results: int = 5) -> str:
    if os.getenv("TAVILY_API_KEY"):
        return tavily_search(queries, max_results)
    else:
        return duckduckgo_search(queries, max_results)