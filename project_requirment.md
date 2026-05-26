# Developement Spec:

This is my personal website project. It will be a frontend project build on github page. I get the reference layout in / References. And all the assets of the image will be in /Assets. U should Read the project frist , help me to de a plan to implement these requriemnts. The plan shoud include:

1. project struetue
2. framework using
3. component implementation list
4. Readme file

The expected frame work of this project will be such as React + p5.js. or other needed tools u think. The project should be rwd , and the example layout on differnt platform will be presented as Destop_view.png and mobile_view.png. The red frames are the sketch hint to told the layout area, not the final visual design so they should not be implimented. Ask any question if the reqiement is not clear for both this md file and the feference design layout.

The project need some centraik setting:

1. theme.js to define the bg color, text size for diffent level, font . color or stroke for different level. also some reuseable react component should also follow these settings as dependcies. The realted size setting should consider the rwd issue.

2. a certain file to manage the content as json of all the text in the website for chinese or engkish version. this part will exclude the content in Projects area.

3. All the project data shuld be maintain as a list of json like:

   {

   img1 source:

   img2 source:

   year

   type: (poster paper/ first authour, artwork , workshop, compettion ....)

   ...

   content en:

   content zh:

   '''

   reference link 1 {text, link}

   }

 and we should got certain componet card to render these informations. (so thta i can maintain theprojects better in the future)

I will brefly exlpain the funtioning of all difertn area in the Reference image as bewlow, and the drawn layout of the proportion u see could be rougly regarded as the proportion i want , so make sire the layout will be fixed under rwd requriemnts :

 

1. Upper container: 

   Containning mainly the playground div profolio_div and the discribtion div , and 2 buttons. MainContent Switcher and the language switcher.
   1. playground div: this will be a p5 canvas. and the efect inside will be preserved now, we impliment it later. But still ensire u leave this space for canvas. (cerate a full canvas here now with stroke to sensure the size)
   2. discribtion div: this will be switch to show the Aboutme / Misson message. the componnet should be able to seleted rendering
   3. perfolio div: this will be hold in an extra contaoner with discrtbion div as upper and downward realtionship in web mode only. (mobile view they will simplely be updand down not holding a rignt contaoner). in this filed , u shoud put a round compoment to put my photo, wich is the portrait.jpg inside , and the icons of email and instargran should be link to other link to ig and mail to that i can fill in later (also mamage in center content file)
2.  Downward container:

   Basicallu , this part will only be a contaoner to show a list of rendered card for those projects store in json format as mentioned above. it should render it form lateds year to most previos years.  and it should be a filter of check list to only show for 1. publications, fist authors, art works, competitions and otthers. 

 

 