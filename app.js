const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");



// DataBase Code
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://harrshyadav24:n4w2B4Havyl4cdvP@cluster0.9lghyzd.mongodb.net/todoDB');

const itemSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
    name: "Welcome to your todolist!"
});
const item2 = new Item({
    name: "Hit the + button to add a new item."
});
const item3 = new Item({
    name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});
const List = mongoose.model("List", listSchema);
// 


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// Middleware to handle favicon.ico request
app.get('/favicon.ico', (req, res) => res.status(204));


app.get("/", async function (req, res) {
    try {
        const foundItem = await Item.find({});
        if (foundItem.length === 0) {
            await Item.insertMany(defaultItems);
            res.redirect("/");
        }
        else {
            res.render('list', { listTitle: "Today", itemsArray: foundItem });
        }
    } catch (error) {
        console.log(error);
    }
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.get("/:listName", async function (req, res) {
    const listName = _.capitalize(req.params.listName);
    try {
        const foundList = await List.findOne({ name: listName });
        if (!foundList) {
            const list = new List({
                name: listName,
                items: defaultItems
            });
            list.save();
            res.redirect("/" + listName);
        } else {
            res.render("list", { listTitle: foundList.name, itemsArray: foundList.items });
        }
    } catch (error) {
        console.log(error);
    }
});


app.post("/", async function (req, res) {
    const newItem = req.body.newItem;
    const listName = req.body.listName;
    const item = new Item({
        name: newItem
    });
    if (listName == "Today") {
        item.save();
        res.redirect("/");
    } else {
        try {
            const foundList = await List.findOne({name: listName});
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        } catch (error) {
            console.log(error);
        }
    }
});

app.post("/delete", async function (req, res) {
    const itemID = req.body.itemID;
    const listName = req.body.listName;

    if (listName === "Today") {
        try {
            const deletedItem = await Item.findByIdAndDelete(itemID);
        } catch (error) {
            console.log(error);
        }
        res.redirect("/");
    } else {
        try {
            const foundList = await List.findOne({name: listName});
            foundList.items.pull(itemID);
            foundList.save();
            res.redirect("/" + listName);
        } catch (error) {
            console.log(error);
        }
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server is running on port 3000");
})