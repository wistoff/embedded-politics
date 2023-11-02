import sys
from pathlib import Path
import gpt4all.gpt4all
from gpt4all import GPT4All
import json
import os
import datetime
import subprocess


gpt4all.gpt4all.DEFAULT_MODEL_DIRECTORY = Path(
    '/Users/kjellxvx/Code/ml/GPT4ALL-Models')
folder_path = gpt4all.gpt4all.DEFAULT_MODEL_DIRECTORY


calcscores = "calcscores.py"
data_folder = './data'
model_name = ''

def get_prompts():
    print("GETTING PROMPTS...")
    with open('./systemPrompt.txt', 'r', encoding='utf8') as file:
        system_template = file.read()
    with open('./prompt.json', 'r') as json_file:
        data = json.load(json_file)
    return system_template, data


def load_model():
    print("LOADING MODEL...")
    return GPT4All(model_name)


def init_data():
    print("INIT DATA...")
    files = os.listdir(data_folder)
    if f"{model_name}.json" in files:
        print(f"Data for the model {model_name} found in {data_folder}")
        with open(os.path.join(data_folder, f"{model_name}.json"), 'r', encoding='utf-8') as file:
            json_data = file.read()
        return json.loads(json_data)
    else:
        default_model_data = {
            "model": {
                "name": model_name
            },
            "score": [0, 0],
            "surveys": []
        }
        return default_model_data


def process_prompts_sequentially(model, prompts):
    print("GENERATING RESPONSE...")
    answered_prompts = []
    for prompt in prompts:
        print('Progress: {}/{}'.format(len(answered_prompts), len(prompts)))
        while True:
            print('STATEMENT: ' + prompt)
            response = ask_llm(prompt)
            validated_response = format_response(response)
            #print(validated_response)
            if validated_response['is_valid'] is True:
                answered_prompt = {
                    'statement': prompt,
                    'answer': validated_response['opinion']
                }
                answered_prompts.append(answered_prompt)
                #print(answered_prompt)
                break
            else:
                print('RAW response:' + response)
                print('--- Invalid response, try again')
    return answered_prompts

def ask_llm(prompt):
    prompt = format_prompt(prompt)
    prompt_template = 'Statement: {0}\nKim:'
    with model.chat_session(system_template, prompt_template):
        output = model.generate(prompt, max_tokens=13, temp=0, top_k=10, top_p=0.75, repeat_penalty=1, repeat_last_n=64, n_batch=8)
        return output

def format_prompt(prompt):
    formatted_prompt = '{"statement": ' + repr(prompt) + '}'
    return formatted_prompt

def format_response(response):
    try:
        response = response.strip()
        response = response.replace("'", '"')
        json_response = extract(response)
        opinion = json_response.get('opinion', None)
        print('ANSWER: ' + opinion)
        is_valid = validate_opinion(opinion)
        return {'is_valid': is_valid, 'opinion': opinion}
    except:
        return {'is_valid': False, 'opinion': "None"}

def extract(response):
    return json.loads(response)

def validate_opinion(opinion):
    try:
        lowercase_opinion = opinion.lower()
        valid_responses = ['agree', 'disagree',
                           'strongly disagree', 'strongly agree']
        return lowercase_opinion in valid_responses
    except:
        return False

def save_data(model_data, answered_prompts):
    new_survey = {
        "date": int(datetime.datetime.now().timestamp()),
        "answers": answered_prompts
    }
    model_data["surveys"].append(new_survey)
    file_name = f"{model_name}.json"
    file_path = f"{data_folder}/{file_name}"
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(model_data, file, indent=2, ensure_ascii=False)
    print(f"New model file saved: {file_path}")
    return model_data

def generate_data_from_model():
    while True:
        answered_prompts = process_prompts_sequentially(model, prompts)
        save_data(model_data, answered_prompts)
        print('--- Questions compelte, data saved to json')
        try:
            subprocess.run(["python", calcscores], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error running the script 'calcscores.py': {e}")

if len(sys.argv) > 1:
    model_name = sys.argv[1]
    print(f"model: {model_name}")
else:
    print("Model argument missing. Please provide a model name.")


system_template, prompts = get_prompts()
model = load_model()
model_data = init_data()
generate_data_from_model()