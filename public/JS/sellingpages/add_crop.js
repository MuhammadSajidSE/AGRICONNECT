function populateCropNames() {
    var categorySelect = document.getElementById("category");
    var cropSelect = document.getElementById("cropname");
    var selectedCategory = categorySelect.value;
    cropSelect.innerHTML = "";
    var fruits = [
        'Apple',
        'Banana',
        'Grape',
        'Watermelon',
        'Orange',
        'Mango',
        'Sapodilla',
        'Date',
        'flig',
        'Guava',
        'Kiwi',
        'Lychee',
        'Melon',
        'Papaya',
        'Strawberry',
        'Peach',
        'Pineapple',
        'Plum',
        'Coconut',
        'Pomergrana'
    ]
    var vegetables = [
        'Potato',
        'Tomato',
        'Onion',
        'Carrot',
        'Cucumber',
        'Lettuce',
        'Cauliflower',
        'Bell Pepper',
        'Zucchini',
        'Eggplant',
        'Green Bean',
        'Kale',
        'Brussels Sprout',
        'Bitter-gourd',
        'Garlic',
        'Ginger',
        'Peppermint',
        'Pumpkin',
        'Papaya',
        'laddy-finger'
    ]
    var grains = [
        'Wheat',
        'Rice',
        'Corn',
        'Barley',
        'Oats',
        'Rye',
        'Quinoa',
        'Millet',
        'Buckwheat',
        'Sorghum',
        'Hominy'
    ]
    var crops = [];
    switch (selectedCategory) {
        case "Fruits":
            crops = fruits;
            break;
        case "Vegetables":
            crops = vegetables;
            break;
        case "Grains":
            crops = grains;
            break;
        default:
            crops = [];
    }
    for (var i = 0; i < crops.length; i++) {
        var option = document.createElement("option");
        option.value = crops[i];
        option.text = crops[i];
        cropSelect.appendChild(option);
    }
}