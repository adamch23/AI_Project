from transformers import pipeline

# Quick and simple - no setup required
generator = pipeline('text-generation', model='microsoft/DialoGPT-small')

def quick_email():
    prompts = [
        "Write a professional interview invitation email for Alex applying for Marketing Manager:",
        "Write a polite rejection email for Maria who applied for Data Scientist:",
        "Write a friendly follow-up email to David about his UX Designer application:"
    ]
    
    for prompt in prompts:
        print(f"\n🎯 PROMPT: {prompt}")
        result = generator(prompt, max_new_tokens=150, temperature=0.7)
        print(f"📧 RESPONSE:\n{result[0]['generated_text']}")
        print("─" * 60)

if __name__ == "__main__":
    quick_email()