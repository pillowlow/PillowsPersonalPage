# p5 Effect

Check the effct expected layout in the pngs in /refeence again to comfrim what i mean.

Firstly, in this canvas, the content i want will be explained below:

1. bg : the background should follow the darkest bg color in theme.

2. The image array:

   the images will be set to

   {

   1. fruit_bowl_mesh (25%)
   2. fruit_bowl_low_poly 50%)
   3. fruit_bowl_ori (75%)

   }

   and the percent is listening to the outer silder bar.

   this iage array class should retrun the image data (pixel data) for the assigned percetage.

3. The color dot sampler:

   the sampler calss should hold a variable "resolution" (can be a lower number) recipe the image data form the arry and trun them into color dots with the xy corrdonate in the canvas. (this converting) should be sensitive to the canvas width and height so that it could also work wil for rwd. this funtion probly output a color dot arry.

4. The noise appler

   This funtion recie the color dots array, and it will apply a noise , scale accroding to the distance to the specail 4 points (25 40 75), if near those specail point, the nose will be biggger, in a linear realteion ship. and when in the farest position , it still need to be a little noise. 

5. the image dot arry objet should be fixed to the approximalte posistion refer to the refjenec images, and leave a littel sapce for the drag me crcle. 

6. the "drag me" circle will be implemeted later

 

 