from transformers import pipeline
import torch

def test_working_model():
    print("🚀 Testing with DialoGPT-small (guaranteed to work)...")
    
    # Use the model that just worked
    generator = pipeline(
        'text-generation',
        model='microsoft/DialoGPT-small',
        torch_dtype=torch.float32
    )
    
    # Test various HR email scenarios
    test_cases = [
        {
            "name": "John Doe",
            "position": "Software Engineer", 
            "type": "invitation",
            "tone": "professional"
        },
        {
            "name": "Sarah Johnson",
            "position": "Data Analyst",
            "type": "rejection",
            "tone": "polite"
        },
        {
            "name": "Mike Chen",
            "position": "Product Manager",
            "type": "follow-up",
            "tone": "friendly"
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n{'='*70}")
        print(f"📧 TEST CASE {i}:")
        print(f"   Candidate: {case['name']}")
        print(f"   Position: {case['position']}")
        print(f"   Email Type: {case['type']}")
        print(f"   Tone: {case['tone']}")
        print(f"{'='*70}")
        
        prompt = f"Write a {case['tone']} {case['type']} email for {case['name']} who applied for the {case['position']} position. Make it professional and concise."
        
        result = generator(
            prompt,
            max_new_tokens=200,
            num_return_sequences=1,
            temperature=0.7,
            do_sample=True,
            pad_token_id=50256
        )
        
        email_text = result[0]['generated_text']
        print(f"✉️  GENERATED EMAIL:\n{email_text}")
        print("-" * 70)

if __name__ == "__main__":
    test_working_model()