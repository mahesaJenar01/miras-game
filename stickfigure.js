class Base{
    constructor(context, x, y, color){
        this.x= x;
        this.y= y;
        this.color= color;
        this.context= context;
    }
}

class Head extends Base{
    constructor(context, x, y, color, radius){
        super(context, x, y, color);
        this.radius= radius;
    }

    draw(){
        this.context.beginPath();
        this.context.arc(
            this.x, this.y, this.radius, 
            0, Math.PI * 2
        );
        this.context.strokeStyle= this.color;
        this.context.stroke();
        this.context.closePath();
    }
}

class Stickfigure extends Base{
    constructor(context, x, y, color, radius){
        super(context, x, y);
        this.radius= radius;
        this.color= color;
    }

    draw(){
        const head= new Head(this.context, this.x, this.y, this.color, this.radius)
        head.draw()
    }
}