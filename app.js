const express =require("express");
const app = express();
const bodyParser = require("body-parser");
const _ = require('lodash');
const mongoose = require("mongoose");
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
require('dotenv').config();
const date = require(__dirname+"/date.js");

let day = date.getDate();
const mongoDBURL = process.env.URL;

mongoose.connect(mongoDBURL);

const listSchema = {
    name : String
};
const Item = new mongoose.model("Item",listSchema);

const list = {
    name:String,
    items : [listSchema]
}
const List = mongoose.model("List",list);

const item1 = new Item({
    name:"Welcome to ToDO List",
})
const item2 = new Item({
    name:"Press '+' to add new items",
})
const item3 = new Item({
    name:"New items will be displayed",
})
const item4 = new Item ({
    name:"<--- Press this to delete an Item",
})

let defaultItems = [item1,item2,item3,item4];



app.get("/",function(req,res){
    Item.find({}).then(function(items){
        if (items.length === 0){
            Item.insertMany(defaultItems).then(()=> {
                console.log("Successfully Inserted");
            })
            .catch((error) => {
                console.error('Error performing operations:', error);
                mongoose.connection.close();
            });
            res.redirect("/");
        }
        else{
            res.render('list',{listTitle:day,newListItem:items}); 
        }
    })
});


app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}).then(function(foundList){
        if(!foundList){
            const list = new List({
                name: customListName,
                items : defaultItems
            });
            list.save();
            res.redirect("/"+ customListName);
        }
        else{
            res.render('list',{listTitle:customListName,newListItem: foundList.items});
        }
    });

})

app.post("/",function(req,res){
    // if(req.body.list === "Work"){
    //     workItems.push(req.body.data);
    //     res.redirect("/work");
    // }
    // else{
    //     todos.push(req.body.data);
    //     res.redirect("/");
    // }
    const itemName = req.body.data;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });

    if (listName == day){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName}).then((foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }

    
    
});



app.post("/delete",function(req,res){
    const itemId = req.body.checkbox;
    const listName = req.body.listName
    console.log(itemId);
    console.log(listName);
    if(listName == day){
        Item.findByIdAndRemove(itemId).then(function(){
            console.log("Successfully Removed Item");
            res.redirect("/");
        })
        .catch((error) => {
            console.error('Error performing operations:', error);
            mongoose.connection.close();
        });
    }
    else {
        List.findOneAndUpdate({name: listName},{ $pull: { items : {_id : itemId} } }).then(function(){
            console.log("Successfully Removed Item");
            res.redirect("/"+listName);
        })
        .catch((error) => {
            console.error('Error performing operations:', error);
            mongoose.connection.close();
        });
    }
  

})

app.listen(process.env.PORT || 3000,function(){
    console.log("Server is up at 3000 port");
})