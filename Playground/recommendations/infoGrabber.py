import requests
import json

def get_google_books_data(titles):
    base_url = "https://www.googleapis.com/books/v1/volumes"
    results = {}

    for title in titles:
        params = {
            'q': title,
            'maxResults': 1
        }
        response = requests.get(base_url, params=params)
        if response.status_code == 200:
            data = response.json()
            results[title] = data
        else:
            results[title] = {"error": f"Failed to fetch data. Status code: {response.status_code}"}

    return results

def save_results_to_file(results, filename="results.json"):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Results saved to {filename}")

if __name__ == "__main__":
    titles = [
    "Who Was... series",
    "I Am Rosa Parks",
    "I Am Martin Luther King Jr.",
    "The Boy Who Harnessed the Wind (Young Reader’s Edition)",
    "El Deafo",
    "Through My Eyes",
    "Helen Keller: The Story of My Life",
    "Thank You, Mr. Falker",
    "Malala: My Story of Standing Up (Young Readers Edition)",
    "Wilma Unlimited",
    "A Picture Book of Martin Luther King Jr."
]



    book_data = get_google_books_data(titles)
    save_results_to_file(book_data)



# {
#     "no restrictions": {
#         "literary fiction": {},
#         "mystery / thriller": {},
#         "science fiction": {},
#         "fantasy": {},
#         "romance": {},
#         "horror": {},
#         "historical fiction": {},
#         "memoir / biography": {},
#         "non-fiction / self-help": {}
#     },
#     "ya-language": {
#         "literary fiction": {},
#         "mystery / thriller": {},
#         "science fiction": {},
#         "fantasy": {},
#         "romance": {},
#         "horror": {},
#         "historical fiction": {},
#         "memoir / biography": {},
#         "non-fiction / self-help": {}
#     },
#     "ya": {
#         "literary fiction": {},
#         "mystery / thriller": {},
#         "science fiction": {},
#         "fantasy": {},
#         "romance": {},
#         "horror": {},
#         "historical fiction": {},
#         "memoir / biography": {},
#         "non-fiction / self-help": {}
#     },
#     "kids": {
#         "literary fiction": {},
#         "mystery / thriller": {},
#         "science fiction": {},
#         "fantasy": {},
#         "romance": {},
#         "horror": {},
#         "historical fiction": {},
#         "memoir / biography": {},
#         "non-fiction / self-help": {}
#     }
# }