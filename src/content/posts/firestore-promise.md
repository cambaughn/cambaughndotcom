---
title: "Firestore: Use Promise.all instead of .getAll on the web"
description: How to batch query an array of documents in Google Cloud Firestore
date: 2019-09-09
tags: []
---
I was attempting to use `firestore.getAll()` to input an array of references and get them all back at the same time in my web application, but it kept throwing errors. I couldn’t find an easy answer to this, so I wanted to put this out there if you’re running into the same problem.

## **The situation is this: for some technical reason, the .getAll() method does not work on web.**

So the solution is to use a native JavaScript function—Promise.all()—which basically wraps up a bunch of promises, waits for them to resolve, and only then will resolve itself. Essentially, this has the effect of making a bunch of calls to the database act like one, thus creating a batch query.

I couldn’t find any good examples of implementation for this specific situation, so here you go:

```
import db from '../firestore/your_db_init_file';
const getItems = (item_ids, callback) => {  
  let itemRefs = item_ids.map(id => {  
    return db.collection('items').doc(id).get();  
  });  Promise.all(itemRefs)  
  .then(docs => {  
    let items = docs.map(doc => doc.data());  
    callback(items);  
  })  
  .catch(error => console.log(error))  
}
```


Essentially, you’re using the .**map** method to return an array of promises, which you then pass to **Promise.all**, which waits for that entire array to resolve before continuing with its own **.then** method.

So, in practical use, you have this function, and you pass it an array of document ids corresponding to the documents you want to get back from your Firestore database.

```
// Define the array of ids that you want your function to retrieve (this can, of course, be input programatically) 
let itemsToGet = ['item-29', 'item-645', 'item-1337', ...];

// Then, call the function  
getItems(itemsToGet, items => console.log(items));
```


Using this strategy, you aren’t limited to just retrieving documents. You can make any Firestore call that you want. For example, to **update** a field for a bunch of specific users:

```
const givePointsToWinningTeam = (team_members, callback) => {  
  let teamMemberRefs = team_members.map(id => {  
    return db.collection('users').doc(id).update({ points: 20 });  
  });  
    
  Promise.all(teamMemberRefs)  
  .then(() => {  
    callback();  
  })  
  .catch(error => console.log(error))  
}
```

Or, if you need to delete a bunch of blog posts:

```
const deleteBlogPosts = (post_ids, callback) => {  
  let postRefs = post_ids.map(id => {  
    return db.collection('blog_posts').doc(id).delete();  
  });  
    
  Promise.all(postRefs)  
  .then(() => {  
    callback();  
  })  
  .catch(error => console.log(error))  
}
```

Once you get the hang of it, using Promise.all() is incredibly straightforward and convenient for performing operations for a bunch of specific documents in a collection on Firestore.

Firestore’s inability to perform batch operations on web is one of its huge shortcomings at the moment, but this approach makes easy work of it and provides a convenient workaround.

As I mentioned, I couldn’t find this information anywhere, so I hope this is helpful!