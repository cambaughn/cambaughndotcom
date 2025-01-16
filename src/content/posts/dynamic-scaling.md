---
title: React Native - Ignore dynamic scaling on iOS
description: Set defaultProps globally to determine font size and accessibility options
date: 2019-11-25
tags:
---
Apple has a feature where folks who use reading glasses or are otherwise vision-impaired can adjust the text size on their devices. I’ve seen it called dynamic scaling, or simply font scaling, and it’s a great feature that’s really important for people to be able to use their devices properly.

That being said, I couldn’t find a succinct and accurate explanation of how work with this feature in React Native. Specifically, I want to turn off dynamic scaling for the time being, as I was getting bug reports that text was flowing off the screen and pushing buttons around to where they disappeared as well.

The quickest fix for the moment is to turn it off by default across the whole app so that people can actually use it as expected, while I work on how to support it in a more graceful way than just having Apple make all the text in the app GIANT.

_You can find text size options on iPhone under Settings > Accessibility > Display and Text Size > Larger Text (if you want to test this out for yourself)_

So, if you want to turn off/ignore dynamic text scaling on iOS in React Native, here’s how to do it. In the root component of your app (in my case, it’s App.js located in the root directory), include the following code in the constructor:

```
// You'll probably have other things imported as well, but make sure Text is one of them

import { Text } from 'react-native';

constructor() {  
    super();  
    // Ignore dynamic type scaling on iOS  
    Text.defaultProps = Text.defaultProps || {}; 
    Text.defaultProps.allowFontScaling = false;   
 }
```

Note that we have to manually set up defaultProps for the Text object. All we’re doing is saying “If there are already defaultProps, cool, we’ll keep them. If not, we’ll set it to an empty object.” From the forum responses I’ve seen out there, it seems like this is a quirk of more recent updates to React Native, so we’ll deal with it this way for now. With this set up, anytime you use Text in your app, it will default to these settings.

This is a pretty simple solution that required a good bit of Googling to figure out, so I hope it helps you to have it in one place.

As I mentioned above, I definitely suggest we all figure out how to work with this feature more gracefully to support accessibility across the board, but if it’s causing problems and you need to turn it off by default, there you go.