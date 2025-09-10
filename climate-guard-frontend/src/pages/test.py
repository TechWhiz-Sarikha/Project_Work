import streamlit as st
import requests

# === Insert your OpenRouter API key here ===
OPENROUTER_KEY = "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"  # replace with your actual key

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Streamlit UI
st.title("OpenRouter Chatbot")

user_input = st.text_input("You:", "")

if st.button("Send"):
    if user_input.strip() == "":
        st.warning("Please enter a message.")
    else:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",  # or another model ID you have access to
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_input}
            ],
            "max_tokens": 300
        }
        
        with st.spinner("Getting response..."):
            response = requests.post(OPENROUTER_URL, json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            reply = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            st.text_area("Bot:", value=reply, height=200)
        else:
            st.error(f"Error {response.status_code}: {response.text}")
