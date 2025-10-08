using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using NP_04_TcpClient;
using TcpListener;
using Command = NP_04_TcpClient.Command;

var client = new HttpClient();



while (true)
{
    Console.Clear();
    Console.Write("Write POST,GET or PUT request : ");
    var methodType =  Console.ReadLine().ToUpper();

    switch (methodType)
    {
        case Command.post:
        {
            Console.Clear();
            var car = CreateCar();
            
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            await client.PostAsync(new Uri(@"http://localhost:21007"),new StringContent(JsonSerializer.Serialize(car)));
            
            break;
        }

        case Command.get:
        {
            Console.Clear();
            
            client.DefaultRequestHeaders.Add("Accept", "text/plain");
            
            var responseMessage = await client.GetAsync(@"http://localhost:21007");
            
            var cars = JsonSerializer.Deserialize<List<Car>>(responseMessage.Content.ReadAsStringAsync().Result);
            cars.ForEach(Console.WriteLine);

            Console.WriteLine("Press any key to continue");
            Console.ReadKey();
            
            break;
        }

        case Command.put:
        {
            Console.Clear();
            
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            
            var responseMessage = await client.GetAsync(@"http://localhost:21007");
            
            var cars = JsonSerializer.Deserialize<List<Car>>(responseMessage.Content.ReadAsStringAsync().Result);
            cars.ForEach(Console.WriteLine);

            Console.Write("Write id: ");
            int id = int.Parse(Console.ReadLine());

            if (cars.Last().Id < id)
            {
                Console.Clear();
                Console.WriteLine("There is no car with this Id \nPress any key to continue");
                Console.ReadKey();
                Console.Clear();
                break;
            }            
            
            Console.Clear();
            var car = CreateCar();
            car.Id = id;
            
            var param = new Command(){Car = car,Param = id.ToString()};
            
            Console.WriteLine($"Prees any key to continue");
            Console.ReadKey();
            
            client.PutAsync("http://localhost:21007", new StringContent(JsonSerializer.Serialize(param)));
            
            break;
        }

    }
}

Car CreateCar()
{
    
    Console.WriteLine("Mark : ");
    string Mark = Console.ReadLine();
    Console.Clear();
            
    Console.WriteLine("Model: ");
    string Model = Console.ReadLine();
    Console.Clear();
            
    Console.WriteLine("Year: ");
    int Year = int.Parse(Console.ReadLine());
    Console.Clear();
            
    Console.WriteLine("Color: ");
    string Color = Console.ReadLine();
    Console.Clear();
    
    return  new Car(){Model = Model, Year = Year, Color = Color, Mark = Mark};
}