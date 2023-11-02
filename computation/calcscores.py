import os
import json

e0 = 0.38
s0 = 2.41

econv = [
  [7, 5, 0, -2], # p1
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [7, 5, 0, -2], # p2
  [-7, -5, 0, 2],
  [6, 4, 0, -2],
  [7, 5, 0, -2],
  [-8, -6, 0, 2],
  [8, 6, 0, -2],
  [8, 6, 0, -1],
  [7, 5, 0, -3],
  [8, 6, 0, -1],
  [-7, -5, 0, 2],
  [-7, -5, 0, 1],
  [-6, -4, 0, 2],
  [6, 4, 0, -1],
  [0, 0, 0, 0],
  [0, 0, 0, 0], # p3
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [-8, -6, 0, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [-10, -8, 0, 1],
  [-5, -4, 0, 1],
  [0, 0, 0, 0], # p4
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0], # p5
  [0, 0, 0, 0],
  [-9, -8, 0, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0], # p6
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
]

socv = [
  [0, 0, 0, 0], # p1
  [-8, -6, 0, 2],
  [7, 5, 0, -2],
  [-7, -5, 0, 2],
  [-7, -5, 0, 2],
  [-6, -4, 0, 2],
  [7, 5, 0, -2],
  [0, 0, 0, 0], # p2
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [-6, -4, 0, 2], # p3
  [7, 6, 0, -2],
  [-5, -4, 0, 2],
  [0, 0, 0, 0],
  [8, 4, 0, -2],
  [-7, -5, 0, 2],
  [-7, -5, 0, 3],
  [6, 4, 0, -3],
  [6, 3, 0, -2],
  [-7, -5, 0, 3],
  [-9, -7, 0, 2],
  [-8, -6, 0, 2],
  [7, 6, 0, -2],
  [-7, -5, 0, 2],
  [-6, -4, 0, 2],
  [-7, -4, 0, 2],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [7, 5, 0, -3], # p4
  [-9, -6, 0, 2],
  [-8, -6, 0, 2],
  [-8, -6, 0, 2],
  [-6, -4, 0, 2],
  [-8, -6, 0, 2],
  [-7, -5, 0, 2],
  [-8, -6, 0, 2],
  [-5, -3, 0, 2],
  [-7, -5, 0, 2],
  [7, 5, 0, -2],
  [-6, -4, 0, 2],
  [-7, -5, 0, 2], # p5
  [-6, -4, 0, 2],
  [0, 0, 0, 0],
  [-7, -5, 0, 2],
  [-6, -4, 0, 2],
  [-7, -6, 0, 2], # p6
  [7, 6, 0, -2],
  [7, 5, 0, -2],
  [8, 6, 0, -2],
  [-8, -6, 0, 2],
  [-6, -4, 0, 2]
]

data_folder = './data'

def get_models():
    files = os.listdir(data_folder)
    models = [os.path.splitext(file)[0] for file in files]
    return models

def get_surveys(model):
    model_data = load_model_surveys(model)
    return [
        {
            "date": survey["date"],
            "answers": [map_to_integer(answer["answer"]) for answer in survey["answers"]]
        }
        for survey in model_data["surveys"]
    ]

def load_model_surveys(name):
    file_name = f'{name}.json'
    file_path = os.path.join(data_folder, file_name)
    with open(file_path, 'r') as file:
        model_data = json.load(file)
    return model_data

def map_to_integer(answer):
    lowercase_response = answer.lower()
    if lowercase_response == 'strongly disagree':
        return 0
    elif lowercase_response == 'disagree':
        return 1
    elif lowercase_response == 'agree':
        return 2
    elif lowercase_response == 'strongly agree':
        return 3
    else:
        print('Invalid response:', answer)
        return -1

def get_score_data(surveys):
    score_data = []
    for survey in surveys:
        sum_e = 0
        sum_s = 0
        for i in range(62):
            if survey["answers"][i] != -1:
                sum_e += econv[i][survey["answers"][i]]
                sum_s += socv[i][survey["answers"][i]]
        val_e = sum_e / 8.0
        val_s = sum_s / 19.5
        val_e += e0
        val_s += s0
        # val_e = round(val_e, 5)
        # val_s = round(val_s, 5)
        score_data.append({"date": survey["date"], "evaluation": [val_e, val_s]})
    return score_data

def append_scores_to_model_data(score_data, model):
    model_data = load_model_surveys(model)

    updated_surveys = model_data["surveys"]
    for i in range(len(updated_surveys)):
        updated_surveys[i]["score"] = score_data[i]["evaluation"]

    model_data["surveys"] = updated_surveys
    total_scores = [0, 0]
    for survey in updated_surveys:
        score_e, score_s = survey["score"]
        total_scores[0] += score_e
        total_scores[1] += score_s
    average_score = [sum_score / len(updated_surveys) for sum_score in total_scores]
    model_data["score"] = average_score
    return model_data

def save_data(model_data):
    file_name = f'{model_data["model"]["name"]}.json'
    file_path = os.path.join(data_folder, file_name)
    with open(file_path, 'w') as file:
        json.dump(model_data, file, indent=2, ensure_ascii=False)
    print(f'Model Score updated: {file_path}')


def update_model_scores(models):
    all_model_data = []  # Create an empty list to store data for all models
    for model in models:
        surveys = get_surveys(model)
        score_data = get_score_data(surveys)
        model_data = append_scores_to_model_data(score_data, model)
        save_data(model_data)
        all_model_data.append(model_data)  # Append the data for the current model to the list

    return all_model_data  # Return the list of data for all models

def calc_score():
    models = get_models()
    model_data = update_model_scores(models)
    #print(model_data)

calc_score()
