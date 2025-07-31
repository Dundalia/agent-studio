# Supabase Database Setup

Follow these steps to set up the database schema in your Supabase project.

## Prerequisites

- Supabase project created at: https://supabase.com
- Access to the Supabase dashboard

## Steps to Execute the SQL Script

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor (in the left sidebar)
3. Click "New Query"
4. Copy and paste the contents of `supabase-schema.sql` into the editor
5. Click "Run" to execute the SQL script

## Verify the Setup

After running the script, verify that the following tables have been created:

1. `conversations`
2. `messages`

You can check this by:
1. Going to the "Table Editor" in the Supabase dashboard
2. Confirming that both tables appear in the list
3. Checking that the tables have the correct columns and constraints

## SQL Script Contents

For reference, here's the SQL script that was executed:

```sql
-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## Troubleshooting

If you encounter any errors when running the SQL script:

1. Check if the tables already exist (you might need to drop them first)
2. Ensure you have the necessary permissions in your Supabase project
3. Verify that the SQL syntax is compatible with your Supabase version

For further assistance, refer to the [Supabase documentation](https://supabase.com/docs).
