# MyFamilyWeb_v1.0
This is me and my son to study HTML. For my family to study things.

Follow is my Page structure.

MyFamilyWeb_v1.0/
├── css/
│   └── main.css
├── data/
│   ├── icons/
│   ├── images/
│   ├── JSON/
│   │   └── hiragana.json
├── features/
│   ├── feature1/  
│   │   ├── feature1.html  
│   │   ├── feature1.js  
│   │   └── feature1.css  
│   └── feature2/  
│       ├── feature2.html  
│       ├── feature2.js  
│       └── feature2.css  
├── js/  
│   ├── utils/  
│   │   ├── helpers.js
│   │   └── feature-i18n.js
│   └── app.js  
├── index.html  
└── README.md  

===========

1.Main Page (index.html)
Entry point of the application.

2.Hiragana Table (features/hiraganaTable/)
Interactive table displaying Hiragana characters.

3.Practice Drill (features/practiceDrillHiragana/)
Quiz-style drills for memorizing Hiragana.

4.Data & Styling
data/hiragana.json – Contains Hiragana character data.
css/main.css – Global styles.
js/app.js – Main JavaScript logic.
js/utils/helpers.js – Utility functions.
js/utils/feature-i18n.js – Shared translations for features 1–24, using the language selected on the home page. Feature 25 keeps its own language system.
Feature-specific translated game content is stored beside its game files, such as the question sets in features/feature12/ and features/feature16/.


5. Infinite Math Platformer (features/feature25/)
A self-contained endless platform game with math challenges, worlds, upgrades, and touch controls. Open it from the home page or directly at features/feature25/feature25.html.
