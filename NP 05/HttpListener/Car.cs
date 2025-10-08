namespace TcpListener;

public class Car
{
    public Car(){}
    
    public int Id { get; set; }
    public  string Mark { get; set; }
    public  string Model { get; set; }
    public  int Year { get; set; }
    public  string Color { get; set; }
    
    override public string ToString()
    {
        return $@"Id : {Id}
                  Mark : {Mark}
                  Model : {Model}
                  Year : {Year}
                  Color : {Color} 
                                    ";
    }
}