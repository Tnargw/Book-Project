import requests
import json
import time

# Mapping to handle mismatched keys between titles_data and template
key_mapping = {
    "romance / friendship": "romance",
    "horror / spooky": "horror",
    "mystery": "mystery / thriller"
}

# Template structure fully matching your data
template = {
    "no restrictions": {
        "literary fiction": [], "mystery / thriller": [], "science fiction": [], "fantasy": [],
        "romance": [], "horror": [], "historical fiction": [], "memoir / biography": [], "non-fiction / self-help": []
    },
    "ya-language": {
        "literary fiction": [], "mystery / thriller": [], "science fiction": [], "fantasy": [],
        "romance": [], "horror": [], "historical fiction": [], "memoir / biography": [], "non-fiction / self-help": []
    },
    "ya": {
        "literary fiction": [], "mystery / thriller": [], "science fiction": [], "fantasy": [],
        "romance": [], "horror": [], "historical fiction": [], "memoir / biography": [], "non-fiction / self-help": []
    },
    "kids": {
        "literary fiction": [], "mystery": [], "science fiction": [], "fantasy": [],
        "romance / friendship": [], "horror / spooky": [], "historical fiction": [], "memoir / biography": [], "non-fiction / self-help": []
    }
}

# Example subset (you'd actually build the full version like this for each genre)
titles_data = {
        "no restrictions": {
        "literary fiction": [
            "To Kill a Mockingbird", "The Great Gatsby", "1984", "The Catcher in the Rye", "Beloved",
            "Pride and Prejudice", "The Road", "A Man Called Ove", "Where the Crawdads Sing", "Normal People",
            "The Goldfinch", "Little Fires Everywhere", "The Night Circus", "The Book Thief", "The Kite Runner",
            "Circe", "The Secret History", "Shantaram", "Lessons in Chemistry", "Tomorrow, and Tomorrow, and Tomorrow"
        ],
        "mystery / thriller": [
            "Gone Girl", "The Girl on the Train", "The Da Vinci Code", "The Silent Patient", "Big Little Lies",
            "The Girl with the Dragon Tattoo", "Sharp Objects", "The Reversal", "In the Woods", "Before I Go to Sleep",
            "Verity", "Behind Closed Doors", "The Couple Next Door", "The Chain", "Then She Was Gone",
            "I Am Watching You", "The Family Upstairs", "Anxious People", "The Last Thing He Told Me", "The Housemaid"
        ],
        "science fiction": [
            "Dune", "Ender's Game", "The Martian", "1984", "Brave New World", "Neuromancer", "Snow Crash", 
            "Ready Player One", "Fahrenheit 451", "The Left Hand of Darkness", "Project Hail Mary", "Station Eleven", 
            "The Three-Body Problem", "Red Rising", "Hyperion", "The Power", "Children of Time", 
            "An Absolutely Remarkable Thing", "Sea of Tranquility", "Klara and the Sun"
        ],
        "fantasy": [
            "Harry Potter series", "The Lord of the Rings", "A Game of Thrones", "The Name of the Wind", "Mistborn",
            "The Hobbit", "Throne of Glass", "A Court of Thorns and Roses", "Shadow and Bone", 
            "The Priory of the Orange Tree", "The Night Circus", "The Magicians", "The Poppy War", 
            "Children of Blood and Bone", "The House in the Cerulean Sea", "The Atlas Six", "Eragon", 
            "The Wheel of Time series", "Ninth House", "Legends & Lattes"
        ],
        "romance": [
            "Pride and Prejudice", "The Notebook", "Me Before You", "Outlander", "The Rosie Project", "The Hating Game", 
            "It Ends With Us", "Beach Read", "People We Meet on Vacation", "Book Lovers", "The Kiss Quotient", 
            "The Love Hypothesis", "Red, White & Royal Blue", "One Day", "Twilight", "The Wedding Date", 
            "The Spanish Love Deception", "November 9", "Ugly Love", "Things We Never Got Over"
        ],
        "horror": [
            "The Shining", "Dracula", "Frankenstein", "Mexican Gothic", "House of Leaves", "Bird Box", 
            "The Haunting of Hill House", "The Exorcist", "Misery", "Pet Sematary", "The Silence of the Lambs", 
            "The Southern Book Club's Guide to Slaying Vampires", "The Only Good Indians", "The Troop", "Final Girls", 
            "My Best Friend's Exorcism", "The Cabin at the End of the World", "Something Wicked This Way Comes", 
            "The Girl from the Well", "Horrorstör"
        ],
        "historical fiction": [
            "All the Light We Cannot See", "The Book Thief", "The Nightingale", "The Tattooist of Auschwitz", 
            "The Alice Network", "The Paris Library", "The Pillars of the Earth", "Beneath a Scarlet Sky", 
            "The Help", "Water for Elephants", "The Guernsey Literary and Potato Peel Pie Society", 
            "A Gentleman in Moscow", "The Night Watchman", "Hamnet", "Before We Were Strangers", 
            "The Book Woman of Troublesome Creek", "The Paris Architect", "The Seven Husbands of Evelyn Hugo", 
            "Daisy Jones & The Six", "Lessons in Chemistry"
        ],
        "memoir / biography": [
            "Becoming", "Educated", "Born a Crime", "The Glass Castle", "Wild", "When Breath Becomes Air", 
            "Bossypants", "Just as I Am", "Greenlights", "Steve Jobs", "The Diary of a Young Girl", 
            "I Am Malala", "Know My Name", "Crying in H Mart", "The Year of Magical Thinking", "Spare", 
            "Eat, Pray, Love", "The Tender Bar", "Finding Me", "No One Is Talking About This"
        ],
        "non-fiction / self-help": [
            "Atomic Habits", "The Subtle Art of Not Giving a Fck*", "Thinking, Fast and Slow", "Outliers", 
            "Daring Greatly", "Grit", "Man's Search for Meaning", "Can't Hurt Me", "Quiet", "The Power of Now", 
            "12 Rules for Life", "You Are a Badass", "How to Win Friends and Influence People", "Deep Work", 
            "Make Your Bed", "Think Like a Monk", "The Body Keeps the Score", "The Four Agreements", 
            "Stolen Focus", "Essentialism"
        ]
    },
        "ya-language": {
        "literary fiction": [
            "To Kill a Mockingbird", "The Giver", "A Tree Grows in Brooklyn", "The Book Thief", "The Secret Garden",
            "Wonder", "The Boy in the Striped Pajamas", "The Little Prince", "Anne of Green Gables", "Stargirl",
            "Because of Winn-Dixie", "The Wednesday Wars", "Peace Like a River", "My Ántonia", "The Westing Game",
            "A Man Called Ove", "Tuck Everlasting", "Bridge to Terabithia", "Roll of Thunder, Hear My Cry",
            "Where the Red Fern Grows"
        ],
        "mystery / thriller": [
            "The Westing Game", "Sherlock Holmes series", "The Hound of the Baskervilles", "Murder on the Orient Express",
            "And Then There Were None", "The 39 Clues series", "The Mysterious Benedict Society",
            "The Boxcar Children series", "From the Mixed-Up Files of Mrs. Basil E. Frankweiler", "Chasing Vermeer",
            "Greenmantle", "The Father Brown Stories", "The Hardy Boys series", "Nancy Drew series",
            "Escape From Mr. Lemoncello's Library", "Enola Holmes series", "Framed!", "A Study in Charlotte",
            "The Inheritance Games", "The Screaming Staircase"
        ],
        "science fiction": [
            "Ender's Game", "The Giver", "Among the Hidden", "A Wrinkle in Time", "Cinder", "The City of Ember",
            "Skyward", "The House of the Scorpion", "Ready Player One", "The Maze Runner", "The True Meaning of Smekday",
            "The Wild Robot", "Project Hail Mary", "Dragon Pearl", "Fahrenheit 451", "The War of the Worlds",
            "The Time Machine", "The White Mountains", "Leviathan", "Animorphs series"
        ],
        "fantasy": [
            "The Chronicles of Narnia", "The Hobbit", "The Lord of the Rings", "Harry Potter series", "Eragon",
            "The Wingfeather Saga", "Howl's Moving Castle", "Ella Enchanted", "The Princess Academy", "The Penderwicks",
            "Inkheart", "The Ranger's Apprentice series", "Fablehaven series", "Dragonwatch", "The Land of Stories",
            "Keeper of the Lost Cities", "Wings of Fire", "Redwall", "Percy Jackson & the Olympians", "The Tale of Despereaux"
        ],
        "romance": [
            "Anne of Green Gables", "Pride and Prejudice", "Emma", "Jane Eyre", "Daddy-Long-Legs", "The Blue Castle",
            "The Goose Girl", "My Lady Jane", "Love and Gelato", "To All the Boys I've Loved Before", "Edenbrooke",
            "The Selection", "Heidi", "Little Women", "Sense and Sensibility", "The Anne of Avonlea series",
            "Once Upon a Marigold", "P.S. I Like You", "The Princess Bride", "Beauty"
        ],
        "horror": [
            "Coraline", "The Graveyard Book", "Scary Stories to Tell in the Dark", "Goosebumps series", "Lockwood & Co.",
            "Bunnicula", "The Screaming Staircase", "The House With a Clock in Its Walls", "Wait Till Helen Comes",
            "The Night Gardener", "Small Spaces", "Doll Bones", "The Witches", "Miss Peregrine's Home for Peculiar Children",
            "City of Ghosts", "The Thickety", "Spirit Hunters", "Monsterstreet", "The Peculiar", "Wishtree"
        ],
        "historical fiction": [
            "Number the Stars", "The War That Saved My Life", "Esperanza Rising", "The Watsons Go to Birmingham – 1963",
            "The Book Thief", "Roll of Thunder, Hear My Cry", "Sarah, Plain and Tall", "Bud, Not Buddy",
            "Island of the Blue Dolphins", "The Bronze Bow", "Johnny Tremain", "Caddie Woodlawn", "Shiloh",
            "The Sign of the Beaver", "Twenty and Ten", "The Upstairs Room", "The Green Glass Sea", "Journey to Topaz",
            "Letters from Rifka", "Out of the Dust"
        ],
        "memoir / biography": [
            "The Diary of a Young Girl", "I Am Malala", "Born a Crime", "The Boy Who Harnessed the Wind", "Through My Eyes",
            "Brown Girl Dreaming", "El Deafo", "The Story of My Life", "Rocket Boys / October Sky", "Knots in My Yo-Yo String",
            "My Side of the Mountain", "Steve Jobs: The Man Who Thought Different", "Soul Surfer", "Red Scarf Girl",
            "Just As I Am", "George Müller: The Guardian of Bristol's Orphans", "Gifted Hands",
            "Corrie ten Boom: Keeper of the Angels' Den", "A Long Walk to Water", "When Stars Are Scattered"
        ],
        "non-fiction / self-help": [
            "The 7 Habits of Highly Effective People", "Do Hard Things", "Atomic Habits", "Make Your Bed", "Start With Why",
            "Mindset", "Quiet", "Grit", "The Power of Habit", "Outliers", "Deep Work", "The Compound Effect",
            "Essentialism", "Think Again", "Drive", "The Magic of Thinking Big", "Man's Search for Meaning",
            "What Color Is Your Parachute?", "How to Win Friends and Influence People", "Living Forward"
        ]
    },
        "ya": {
        "literary fiction": [
            "To Kill a Mockingbird", "The Giver", "Little Women", "Anne of Green Gables", "The Book Thief",
            "The Secret Garden", "A Tree Grows in Brooklyn", "The Guernsey Literary and Potato Peel Pie Society",
            "My Ántonia", "Peace Like a River", "The Wednesday Wars", "I Capture the Castle", "Jayber Crow",
            "The Chosen", "A Man Called Ove", "The No. 1 Ladies' Detective Agency", "The Boy in the Striped Pajamas",
            "Chasing Vermeer", "Ella Minnow Pea", "Counting by 7s"
        ],
        "mystery / thriller": [
            "The Westing Game", "Murder on the Orient Express", "And Then There Were None", "The Sweetness at the Bottom of the Pie",
            "Father Brown Mysteries", "Sherlock Holmes series", "The Mysterious Benedict Society", "Greenglass House",
            "The 39 Clues", "The London Eye Mystery", "Escape from Mr. Lemoncello's Library", "Winterhouse",
            "The Boxcar Children series", "The Enola Holmes Mysteries", "Sammy Keyes series",
            "The Wollstonecraft Detective Agency", "The Clockwork Three", "Nate the Great",
            "The Incorrigible Children of Ashton Place", "Murder Is Easy"
        ],
        "science fiction": [
            "The Giver", "A Wrinkle in Time", "Ender's Game", "The City of Ember", "Among the Hidden", "Skyward",
            "Cinder", "Frindle", "The Wild Robot", "Dragon Pearl", "Space Case", "Gregor the Overlander",
            "Mrs. Frisby and the Rats of NIMH", "Aquifer", "Voyage of the Dogs", "The True Meaning of Smekday",
            "The Green Book", "Cosmic", "Eva", "The Wonderful Flight to the Mushroom Planet"
        ],
        "fantasy": [
            "The Hobbit", "The Chronicles of Narnia", "Ella Enchanted", "Howl's Moving Castle", "Fablehaven",
            "Wings of Fire", "Percy Jackson & the Olympians", "The Wingfeather Saga", "The Princess and the Goblin",
            "Inkheart", "Redwall", "Artemis Fowl", "The Keeper of the Lost Cities", "Dragon Rider", "The Land of Stories",
            "The Ranger's Apprentice", "The Tale of Despereaux", "The Chronicles of Prydain", "The Candy Shop War",
            "The Girl Who Drank the Moon"
        ],
        "romance": [
            "Pride and Prejudice", "Emma", "Jane Eyre", "Daddy-Long-Legs", "Dear Mr. Knightley", "Edenbrooke",
            "The Blue Castle", "My Lady Jane", "The Penderwicks series", "The Goose Girl", "Love and Luck",
            "Love & Gelato", "Sweethearts", "North and South", "Anna and the French Kiss",
            "The Statistical Probability of Love at First Sight", "To All the Boys I've Loved Before",
            "The Healer's Apprentice", "Unblemished", "Not If I Save You First"
        ],
        "horror": [
            "Coraline", "The Graveyard Book", "Goosebumps series", "Small Spaces", "The Night Gardener",
            "Lockwood & Co.", "The Screaming Staircase", "The Cavendish Home for Boys and Girls", "Spirit Hunters",
            "Ghost Squad", "The Haunting of Henry Davis", "The Jumbies", "Bunnicula", "The Dollhouse Murders",
            "Scary Stories to Tell in the Dark", "The Peculiar Incident on Shady Street", "Root Magic",
            "Wait Till Helen Comes", "Deep and Dark and Dangerous", "Ghosts I Have Been"
        ],
        "historical fiction": [
            "Number the Stars", "The War That Saved My Life", "The Hiding Place", "Roll of Thunder, Hear My Cry",
            "Sarah, Plain and Tall", "Little House on the Prairie series", "Island of the Blue Dolphins",
            "Esperanza Rising", "Blue Birds", "The Midwife's Apprentice", "The Bronze Bow", "Carry On, Mr. Bowditch",
            "Catherine, Called Birdy", "The Witch of Blackbird Pond", "Inside Out and Back Again", "Letters from Rifka",
            "Salt to the Sea", "Code Talker", "The Boy Who Dared", "I Survived series"
        ],
        "memoir / biography": [
            "The Diary of a Young Girl", "I Am Malala", "Born a Crime", "The Boy Who Harnessed the Wind", "Through My Eyes",
            "Brown Girl Dreaming", "El Deafo", "The Story of My Life", "Rocket Boys / October Sky", "Knots in My Yo-Yo String",
            "My Side of the Mountain", "Steve Jobs: The Man Who Thought Different", "Soul Surfer", "Red Scarf Girl",
            "Just As I Am", "George Müller: The Guardian of Bristol's Orphans", "Gifted Hands",
            "Corrie ten Boom: Keeper of the Angels' Den", "A Long Walk to Water", "When Stars Are Scattered"
        ],
        "non-fiction / self-help": [
            "The Hiding Place", "I Am Malala (Young Readers Edition)", "Boy: Tales of Childhood", "Gifted Hands",
            "My Side of the Mountain", "Brown Girl Dreaming", "El Deafo", "Through My Eyes", "Who Was... series",
            "George Washington Carver", "Corrie ten Boom: Keeper of the Angels' Den",
            "The Boy Who Harnessed the Wind (Young Reader's Edition)", "Born to Fly",
            "The Wright Brothers: How They Invented the Airplane", "Helen Keller: The Story of My Life",
            "Missionary Stories with the Millers", "Just As I Am", "Climbing the Stairs", "Little House in the Big Woods",
            "The Story of My Life"
        ]
    },
      "kids": {
        "literary fiction": [
            "Charlotte's Web", "Because of Winn-Dixie", "Ramona Quimby, Age 8", "The Hundred Dresses",
            "Sarah, Plain and Tall", "Frindle", "Wonder", "Harriet the Spy", "Ivy + Bean", "Clementine",
            "The Year of Billy Miller", "Jake Drake series", "Henry Huggins", "Rules"
        ],
        "mystery": [
    "Nate the Great (Nate the Great Book 1)",
    "Cam Jansen: The Mystery of the Stolen Diamonds (Cam Jansen #1)",
    "The Boxcar Children (The Boxcar Children #1)",
    "A to Z Mysteries: The Absent Author",
    "The Mysterious Benedict Society (Book 1)",
    "Encyclopedia Brown, Boy Detective (Encyclopedia Brown #1)",
    "Ballpark Mysteries: The Fenway Foul-Up (Ballpark Mysteries #1)",
    "Nancy Drew and the Clue Crew: Sleepover Sleuths (Book 1)",
    "Jigsaw Jones: The Case of Hermie the Missing Hamster (Jigsaw Jones #1)",
    "Saxby Smart: The Curse of the Ancient Mask and Other Case Files",
    "Sherlock Sam and the Missing Heirloom in Katong (Sherlock Sam #1)",
    "Kingdom Keepers: Disney After Dark (Kingdom Keepers #1)"
],

        "science fiction": [
            "The Wild Robot", "Space Case", "Frank Einstein series", "Zita the Spacegirl", "Alien in My Pocket",
            "Hilo series", "Lunch Walks Among Us (Franny K. Stein)", "Mousetronaut", "Voyage of the Dogs", "AstroNuts",
            "The Last Kids on Earth", "Captain Underpants"
        ],
        "fantasy": [
            "The Tale of Despereaux", "The Chronicles of Narnia", "The Magic Tree House series",
            "How to Train Your Dragon", "Dragon Masters", "Frog and Toad", "Ella Enchanted", "Harry Potter and the Sorcerer's Stone",
            "Tuesdays at the Castle", "Wings of Fire (Graphic Novels)", "The Spiderwick Chronicles", "The Unicorn Rescue Society",
            "The Kingdom of Wrenly", "The Neverending Story"
        ],
"romance / friendship": [
    "Ivy and Bean (Ivy + Bean Book 1)", 
    "Frog and Toad Are Friends (Frog and Toad Book 1)", 
    "George and Martha: The Complete Stories of Two Best Friends",
    "The One and Only Ivan (Katherine Applegate)", 
    "The Velveteen Rabbit (Margery Williams)", 
    "The Miraculous Journey of Edward Tulane (Kate DiCamillo)", 
    "A Sick Day for Amos McGee (Philip C. Stead)", 
    "Charlotte's Web (E. B. White)", 
    "A Little Princess (Frances Hodgson Burnett)", 
    "Junie B. Jones Loves Handsome Warren (Junie B. Jones #7)", 
    "Sophie's Squash (Pat Zietlow Miller)"
],
"horror / spooky": [
    "Bunnicula: A Rabbit-Tale of Mystery (James Howe)",
    "The Haunted Library (The Haunted Library #1 by Dori Hillestad Butler)",
    "Scary Stories for Young Foxes (Christian McKay Heidicker)",
    "The Notebook of Doom: Rise of the Balloon Goons (Notebook of Doom #1 by Troy Cummings)",
    "Goosebumps: Welcome to Dead House (R. L. Stine)",
    "Small Spaces (Katherine Arden)",
    "Eerie Elementary: The School Is Alive! (Eerie Elementary #1 by Jack Chabert)",
    "The Peculiar Incident on Shady Street (Lindsay Currie)",
    "Coraline (Neil Gaiman)",
    "Ghosts (Raina Telgemeier)"
],
        "historical fiction": [
            "Number the Stars", "Sarah, Plain and Tall", "Little House on the Prairie", "Esperanza Rising",
            "The Courage of Sarah Noble", "The Sign of the Beaver", "The War that Saved My Life",
            "George Washington's Socks", "My America series", "Meet Addy (American Girl series)", "I Survived series",
            "The Orphan of Ellis Island", "The Matchlock Gun"
        ],
        "memoir / biography": [
            "Who Was... series", "I Am Rosa Parks", "I Am Martin Luther King Jr.", "The Boy Who Harnessed the Wind (Young Reader's Edition)",
            "El Deafo", "Through My Eyes", "Helen Keller: The Story of My Life", "Thank You, Mr. Falker",
            "Malala: My Story of Standing Up (Young Readers Edition)", "Wilma Unlimited", "A Picture Book of Martin Luther King Jr."
        ],
        "non-fiction / self-help": [
            "What Do You Do With a Problem?", "You Can Be a Friend", "The 7 Habits of Happy Kids",
            "What to Do When You Worry Too Much", "A Kids Book About... series", "Mindset for Kids",
            "Listening with My Heart", "How Full Is Your Bucket? For Kids", "Be Kind"
        ]
    }
}

# Load existing filled_books.json
with open("filled_books.json", "r", encoding='utf-8') as f:
    filled_data = json.load(f)

# Google Books request function
def get_google_books_data(title):
    base_url = "https://www.googleapis.com/books/v1/volumes"
    params = {'q': title, 'maxResults': 1}
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        return response.json()
    return {"error": f"Failed to fetch data for {title}"}

# Main loop to check and fill missing data
for audience, genres in titles_data.items():
    for genre, titles in genres.items():
        mapped_genre = key_mapping.get(genre, genre)
        for idx, title in enumerate(titles):
            # Now carefully check which key exists in the filled_data
            filled_genre_key = mapped_genre if mapped_genre in filled_data[audience] else genre
            try:
                data = filled_data[audience][filled_genre_key][idx]
                if not data or ("items" not in data and "error" not in data):
                    raise IndexError  # Treat as missing
            except (IndexError, KeyError):
                print(f"❌ MISSING: [{audience}] [{filled_genre_key}] {title}")
                new_data = get_google_books_data(title)
                if "items" in new_data:
                    print(f"✅ FIXED: {title}")
                else:
                    print(f"⚠ STILL NOT FOUND: {title}")
                while len(filled_data[audience][filled_genre_key]) <= idx:
                    filled_data[audience][filled_genre_key].append(None)
                filled_data[audience][filled_genre_key][idx] = new_data
                time.sleep(0.5)

# Save updated file
with open("filled_books.json", "w", encoding='utf-8') as f:
    json.dump(filled_data, f, indent=2, ensure_ascii=False)

print("✅ All missing data checked and updated.")
