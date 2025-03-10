class BaseGround{
    constructor(context, x, y, height, width){
        this.x= x;
        this.y= y;
        this.width= width;
        this.height= height;
        this.context= context;
    };
};

class SubGround extends BaseGround{
    constructor(context, x, y, height, width, color){
        super(context, x, y, height, width);
        this.color= color;
    }

    draw(){
        this.context.beginPath();
        this.context.fillStyle= this.color;
        this.context.fillRect(
            this.x, this.y, 
            this.width, this.height
        )
        this.context.closePath();
    };
}

class Ground extends BaseGround{
    constructor(context, x, y, height, width){
        super(context, x, y, height, width);
        this.grassHeight= this.height * 0.3;
        this.dirtHeight= this.height - this.grassHeight;
    };

    draw(){
        const grass= new SubGround(
            this.context, this.x,
            this.y, this.grassHeight,
            this.width, "green"
        );

        const dirt= new SubGround(
            this.context, this.x, 
            this.y + this.grassHeight,
            this.dirtHeight, this.width,
            "brown"
        );
        
        grass.draw();
        dirt.draw()
    };
};