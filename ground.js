class BaseGround{
    constructor(context, x, y, height, width){
        this.x= x;
        this.y= y;
        this.width= width;
        this.height= height;
        this.context= context;
    };
};

class Dirt extends BaseGround{
    constructor(context, x, y, height, width, color){
        super(context, x, y, height, width);
        this.color= color;
    }

    draw(){
        this.context.beginPath();
        this.context.fillRect(
            this.x, this.y, 
            this.width, this.height
        )
        this.context.fillStyle= this.color;
        this.context.closePath();
    };
};

class Grass extends BaseGround{
    constructor(context, x, y, height, width, color){
        super(context, x, y, height, width);
        this.color= color;
    }

    draw(){
        this.context.beginPath();
        this.context.fillRect(
            this.x, this.y, 
            this.width, this.height
        )
        this.context.fillStyle= this.color;
        this.context.closePath();
    };
};

class Ground extends BaseGround{
    constructor(context, x, y, height, width){
        super(context, x, y, height, width);
    };

    draw(){
        const dirt= new Dirt(
            this.context, this.x, this.y,
            this.height * 0.2, this.width,
            "#123fff"
        );
        const grass= new Grass(
            this.context, this.x, this.y,
            this.height * 0.8, this.width, 
            "$222fff"
        );

        // dirt.draw();
        grass.draw();
    };
};