# CO2 Emissions Around the World in 2019

Andrew Baker

## New Dataset Used
https://www.kaggle.com/datasets/ravindrasinghrana/carbon-co2-emissions/data

The above dataset contains information regarding carbon emissions by country.

## What is your current goal? Has it changed since the proposal?
In terms of the website concept that I wanted to achieve, my goal has not changed all that much.

I am still going for a scrollytelling format that goes through a narrative as the user scrolls, and there is a portion of the
story at the end that allows for a user to switch from one dataset to antother (total emissions VS per capita emissions).

Moreover, there are tooltips enabled that allow the user to see what country they are hovering over as well as statistics about that country. I am hoping to potentially add more to these tooltips, allowing the user to see a time-series aanalysis of a given country when hovering, since I am only using 2019 data for the time being. 

For now, I have a working concept of this, but I have not filled in a real narrative for anything yet which I will explain below.

## Are there data challenges you are facing? Are you currently depending on mock data?
I was hoping to be able to do the project using the mental health data that I found before, but after some significant searching, I could neither validate the data, nor could I find anything comparable. This put me in a position where I had to change my topic, so as I was working on the structure of the webpage, I looked for any interesting datasets that appeared both valid and complete in terms of countries with exisiting data. I found this dataset that explores CO2 emissions in both total and per capita terms. I am okay continuing to use this, but regardless I set up the site to work with any data, given some adjustments.

Therefore, I have real data, and I am hoping it should be enough for the purpose of this project.

## Walk us through an interaction, either in words or you can record a quick 2-3 minute video.
Once the page loads, the user can begin scrolling. The title container will scroll away, and text boxes will begin to appear at the bottom of the screen beginning some narrative. As the user continues the scroll and the narrative progresses, the map will pan and zoom in on certain areas, allowing the user to see regions more closely and more easily hover over countries. 

At the end, a dropdown will appear at the bottom of the screen, and the user will be able to switch between total emissions and per capita emissions, changing the color scale of the map. Perhaps at this point I should allow the user the ability to zoom in and pan/give them exploring abilities once the story is done and they have the dropdown.

## Include a _numbered_ list of questions for us to respond to.

1. I have been able to match some of the initially unmatched countries to data in the shape file data, as seen in the data cleaning notebook in www. However, there are still some countries that I have not been able to match/do not know what exactly to do with them, and they end up appearing white on the map:
    1. Greenland - It's owned by Denmark, so should it take the same value as Denmark? If not, how should I proceed?
    2. Western Sahara - Due to the conflict between the Sahrawi Arab Democratic Republic and the Kingdom of Morocco, there is not data in the emissions dataset for Western Sahara. How should I approach this?
    3. Côte d'Ivoire - I am unsure why there is no data here, and it is not under "Ivory Coast" either. How should I approach this?
    4. Taiwan - How should I approach this?
    5. Palestine - How should I appraoch this?
    6. Somaliland - How should I approach this?
    7. Kosovo - How should I approach this?

2. Do you think this data set is a good idea? I was a little pressed for time having to find a new dataset alongside creating the webpage, so I'm hoping this is acceptable but open to shifting gears for the final.

3. Is it possible to add time-series charts for individual countries that are contained within the hover/tooltip popouts? I feel like my webpage is lacking a little something, and I'm thinking this would be a good way to round it out.