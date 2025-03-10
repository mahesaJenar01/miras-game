class BaseStickfigure{
    constructor(context, x, y, color, tickness){
        this.x= x;
        this.y= y;
        this.color= color;
        this.context= context;
        this.tickness= tickness;
    };
};

class Head extends BaseStickfigure{
    constructor(context, x, y, color, tickness, radius){
        super(context, x, y, color, tickness);
        this.radius= radius;
    };

    draw(){
        this.context.beginPath();
        this.context.arc(
            this.x, this.y, this.radius, 
            0, Math.PI * 2
        );
        this.context.strokeStyle= this.color;
        this.context.lineWidth= this.tickness;
        this.context.stroke();
        this.context.closePath();
    };
};

class Body extends BaseStickfigure{
    constructor(context, x, y, color, tickness, length= 50){
        super(context, x, y, color, tickness);
        this.length= length;
    }

    draw(){
        this.context.beginPath();
        this.context.moveTo(this.x, this.y);
        this.context.lineTo(this.x, this.y + this.length);
        this.context.strokeStyle= this.color;
        this.context.lineWidth= this.tickness;
        this.context.stroke();
        this.context.closePath();
    };
};

class Hand extends BaseStickfigure{
    constructor(
        context, x, y, color, tickness,  
        isLeft= true, length= 20
    ){
        super(context, x, y, color, tickness);
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
        this.context.lineWidth= this.tickness;
        this.context.stroke();
        this.context.closePath();
    };
};

class Leg extends BaseStickfigure{
    constructor(
        context, x, y, color, tickness, 
        isLeft=true, length= 30
    ){
        super(context, x, y, color, tickness);
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
        this.context.lineWidth= this.tickness;
        this.context.stroke();
        this.context.closePath();
    };
};

class Stickfigure extends BaseStickfigure{
    constructor(context, x, y, color, tickness, radius= 20){
        super(context, x, y, color, tickness);

        this.radius= radius;
        this.bodyLength= this.radius * 2.5;
        this.legsPosition= this.y + (this.bodyLength * 1.4);
        this.handsPosition= this.y + (this.bodyLength * 0.6);
    };

    draw(){
        const head= new Head(
            this.context, this.x, 
            this.y, this.color, this.tickness, 
            this.radius
        );

        const body= new Body(
            this.context, this.x, 
            this.y + this.radius, this.color, 
            this.tickness, this.bodyLength
        );

        
        const leftHand= new Hand(
            this.context, this.x, 
            this.handsPosition, this.color, 
            this.tickness
        );
        const rightHand= new Hand(
            this.context, this.x,
            this.handsPosition, this.color, 
            this.tickness, false
        );
        
        const leftLeg= new Leg(
            this.context, this.x, 
            this.legsPosition, this.color, 
            this.tickness
        );
        const rightLeg= new Leg(
            this.context, this.x, 
            this.legsPosition, this.color, 
            this.tickness, false
        );

        head.draw();
        body.draw();
        leftHand.draw();
        rightHand.draw();
        leftLeg.draw();
        rightLeg.draw();
    };
};