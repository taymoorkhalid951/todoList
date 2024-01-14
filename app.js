//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://taymoorkhalid951:Alyaar_7778@todolist.0l68tgi.mongodb.net/todolistDB')

const itemSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const Item = mongoose.model("Item" , itemSchema);

const List = new mongoose.model("List",listSchema);

const item1 = new Item({
  name:"Welcome to your to do list" 
});
const item2 = new Item({
  name:"Hit the + Button to add a new item" 
});
const item3 = new Item({
  name:"Bye byeee" 
});

const  defaultItems = [item1 , item2 , item3];

async function insertDefaultItems() {
  try {
    const result = await Item.insertMany(defaultItems);
    console.log('Default items inserted successfully:', result);
  } catch (error) {
    console.error('Error inserting default items:', error);
  } 
}


app.get("/", function(req, res) {
  async function finditems(){
    try{
      const foundItems = await Item.find()
      if (foundItems.length === 0){
        insertDefaultItems();
        res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems });
      }
    }catch(err){
      console.log(err);
    }
  }
  finditems();
});

app.get("/:customeListName", function(req,res){
  const customeListName = _.capitalize(req.params.customeListName);
async function findList(){
    const foundList = await List.findOne({name:customeListName});
    if (!foundList){
      const list = new List({
        name:customeListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customeListName);
    }else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }
  findList();
  
})

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item({
    name:itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    async function findList(){
      const foundList = await List.findOne({name:listName});  
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }
    findList();
  }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName; 

  async function deleteItem(){
    try{
      await Item.findByIdAndDelete(checkedItemId);
    }catch(err){
      console.log("Panga pa gaya");
    }
  };

  if (listName === "Today"){
    deleteItem();
    res.redirect("/");
  }else{
    async function findList(){
      await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}});
      res.redirect("/" + listName);
    }
    findList();
  }

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
