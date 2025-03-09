class Base{
    constructor(context, x, y, color){
        this.x= x;
        this.y= y;
        this.color= color;
        this.context= context;
    };
};

class Head extends Base{
    constructor(context, x, y, color, radius){
        super(context, x, y, color);
        this.radius= radius;
    };

    draw(){
        this.context.beginPath();
        this.context.arc(
            this.x, this.y, this.radius, 
            0, Math.PI * 2
        );
        this.context.strokeStyle= this.color;
        this.context.stroke();
        this.context.closePath();
    };
};

class Body extends Base{
    constructor(context, x, y, color, length= 50){
        super(context, x, y, color);
        this.length= length;
    }

    draw(){
        this.context.beginPath();
        this.context.moveTo(this.x, this.y);
        this.context.lineTo(this.x, this.y + this.length);
        this.context.strokeStyle= this.color;
        this.context.lineWidth= 4;
        this.context.stroke();
        this.context.closePath();
    };
};

class Hand extends Base{
    constructor(
        context, x, y, color, 
        isLeft= true, length= 20
    ){
        super(context, x, y, color);
        this.length= length;
        this.isLeft= isLeft;
    };

    draw(){
        this.context.beginPath();
        this.context.moveTo(this.x, this.y);
        if(this.isLeft){
            this.context.lineTo(
                this.x - this.length, 
                this.y + this.length
            );
        } else{
            this.context.lineTo(
                this.x + this.length, 
                this.y + this.length
            );
        };
        this.context.strokeStyle= this.color;
        this.context.lineWidth= 4;
        this.context.stroke();
        this.context.closePath();
    };
};

class Leg extends Base{
    constructor(
        context, x, y, color, 
        isLeft=true, length= 30
    ){
        super(context, x, y, color);
        this.isLeft= isLeft;
        this.length= length;
    };

    draw(){
        this.context.beginPath();
        this.context.moveTo(this.x, this.y);
        if(this.isLeft){
            this.context.lineTo(
                this.x - this.length, 
                this.y + this.length
            );
        } else{
            this.context.lineTo(
                this.x + this.length, 
                this.y + this.length
            );
        };
        this.context.strokeStyle= this.color;
        this.context.lineWidth= 4;
        this.context.stroke();
        this.context.closePath();
    };
};

class Stickfigure extends Base{
    constructor(context, x, y, color, radius){
        super(context, x, y);
        this.radius= radius;
        this.color= color;
        this.handsPosition= 30;
        this.legsPosition= 70;
    };

    draw(){
        const head= new Head(
            this.context, this.x, 
            this.y, this.color, this.radius
        );

        const body= new Body(
            this.context, this.x, 
            this.y + this.radius, this.color
        );

        
        const leftHand= new Hand(
            this.context, this.x, 
            this.y + this.handsPosition, this.color
        );
        const rightHand= new Hand(
            this.context, this.x, 
            this.y + this.handsPosition, this.color, 
            false
        );
        
        const leftLeg= new Leg(
            this.context, this.x, 
            this.y + this.legsPosition, this.color
        );
        const rightLeg= new Leg(
            this.context, this.x, 
            this.y + this.legsPosition, this.color, 
            false
        );

        head.draw();
        body.draw();
        leftHand.draw();
        rightHand.draw();
        leftLeg.draw();
        rightLeg.draw();
    };
};