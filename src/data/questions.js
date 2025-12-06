// Initial Data for seeding the store
export const initialCategories = [
    { id: 'geography', name: 'Geography', icon: '🗺️', color: 'bg-blue-500' },
    { id: 'history', name: 'History', icon: '📜', color: 'bg-amber-600' },
    { id: 'culture', name: 'Culture', icon: '🏛️', color: 'bg-purple-500' },
    { id: 'nature', name: 'Nature', icon: '🌴', color: 'bg-green-500' },
];

export const initialQuestions = [
    {
        id: 1,
        type: 'multiple-choice',
        category: 'geography',
        question: "What is the capital city of Oman?",
        options: ["Salalah", "Sohar", "Muscat", "Nizwa"],
        answer: "Muscat"
    },
    {
        id: 2,
        type: 'fill-blank',
        category: 'culture',
        question: "The national symbol of Oman features a pair of crossed swords and a ______.",
        answer: "Khanjar",
        options: ["Khanjar", "Dallah", "Palm", "Ship"]
    },
    {
        id: 3,
        type: 'order',
        category: 'history',
        question: "Order these Omani rulers chronologically (Oldest to Newest)",
        items: [
            { id: '1', text: "Sultan Said bin Taimur" },
            { id: '2', text: "Sultan Qaboos bin Said" },
            { id: '3', text: "Sultan Haitham bin Tariq" }
        ],
        correctOrder: ['1', '2', '3']
    },
    {
        id: 4,
        type: 'match',
        category: 'geography',
        question: "Match the landmark to its location",
        pairs: [
            { left: "Jebel Shams", right: "Al Hamra" },
            { left: "Sultan Qaboos Grand Mosque", right: "Muscat" },
            { left: "Frankincense Land", right: "Dhofar" }
        ]
    }
];
