//---------Class Tiro----------//
class Tiro{
  constructor(img,x,y,comp,alt){
    this.img = img;
    this.x = x;
    this.y = y;
    this.comp = comp; 
    this.alt = alt;   
  }
  mostraTiro(){
    image(this.img, this.x, this.y, this.comp,this.alt);
  }
}