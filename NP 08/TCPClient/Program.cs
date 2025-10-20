using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using TCP_Multi_Listener;



TcpClient client = new TcpClient();;

await client.ConnectAsync(IPAddress.Loopback, 27001);

var bw = new BinaryWriter(client.GetStream());
var br = new BinaryReader(client.GetStream());

Console.WriteLine("[Server] : Connected to server.");

int currentMove = 0;

while (true)
{
    try
    {


        var serverMessage = JsonSerializer.Deserialize<Game>(br.ReadString());


        if (serverMessage.message.Contains("[Server] : Game ended!"))
        {
            Console.WriteLine($"{serverMessage.message}");
            break;
        }

        if (currentMove != serverMessage.move)
        {

            if (serverMessage.message.Contains("You'r turn !"))
            {
                Console.WriteLine(serverMessage.message);

                for (int i = 0; i < serverMessage.gameField.Length; i++)
                {
                    if (i % 3 == 0 & i != 0) Console.WriteLine();

                    switch (serverMessage.gameField[i])
                    {
                        case 0:
                            Console.Write('_');
                            break;
                        case 1:
                            Console.Write('X');
                            break;
                        case 2:
                            Console.Write('O');
                            break;
                    }
                }

                Console.WriteLine();


                var field = int.Parse(Console.ReadLine()) - 1;
                while (field < 0 || field > 9)
                {
                    Console.WriteLine("You're out of bounds.");
                    Console.Write("Try again : ");
                    field = int.Parse(Console.ReadLine()) - 1;
                }

                while (serverMessage.gameField[field] != 0)
                {
                    Console.WriteLine("This field is already set.");
                    Console.Write("Try again : ");
                    field = int.Parse(Console.ReadLine()) - 1;

                }

                serverMessage.gameField[field] = serverMessage.currentPlayer == serverMessage.xPlayer ? 1 : 2;

                bw.Write(JsonSerializer.Serialize(serverMessage));
                bw.Flush();

                currentMove = serverMessage.move;
            }
            
            Console.Clear();

        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Connection closed: {ex.Message}");
        break;
    }
}