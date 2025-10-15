using System.Collections.Concurrent;
using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using TCP_Multi_Listener;

TcpListener listener = new TcpListener(IPAddress.Loopback, 27001);

ConcurrentBag<TcpClient > clients = new ConcurrentBag<TcpClient>();

listener.Start();

Console.WriteLine("[Server] : Waiting for 2 players...");


while (clients.Count < 2)
{
    var client = await listener.AcceptTcpClientAsync();
    clients.Add(client);

    Console.WriteLine($"[Server] : [{client.Client.RemoteEndPoint}] Connected");
}

Console.WriteLine("[Server] Both players connected!");

var game = new Game() { gameField = [0,0,0,0,0,0,0,0,0], message = "You'r turn !",move = 1};

using var bw1 = new BinaryWriter(clients.ToList()[0].GetStream());
using var br1 = new BinaryReader(clients.ToList()[0].GetStream());

using var bw2 = new BinaryWriter(clients.ToList()[1].GetStream());
using var br2 = new BinaryReader(clients.ToList()[1].GetStream());


var activePlayer = new Random().Next(0, 2);
game.xPlayer = activePlayer;


while (true)
{
    try
    {
        var currentWriter = activePlayer == 0 ?  bw1 : bw2;
        var currentReader = activePlayer == 0 ? br1 : br2;
        var otherWriter = activePlayer == 0 ? bw2 : bw1;
        
        game.currentPlayer = activePlayer;
        
        currentWriter.Write(JsonSerializer.Serialize(game));
        currentWriter.Flush();

        var msg = JsonSerializer.Deserialize<Game>(currentReader.ReadString());
        
        // проверка на ничья
        if (!msg.gameField.Contains(0))
        {
            msg.message = "[Server] : Game ended! draw ";
            currentWriter.Write(JsonSerializer.Serialize(msg));
            otherWriter.Write(JsonSerializer.Serialize(msg));
            listener.Stop();
            break;
        }
        
        // проверка победителя 
        for (var i = 0; i < 9; i++)
        {
            if (msg.gameField[i] != 0)
            {
                if (i % 3 == 0) // проверка по горизонтали 
                {
                    if (msg.gameField[i] == msg.gameField[i + 1] && msg.gameField[i] == msg.gameField[i + 2])
                    {
                        if (msg.gameField[i] == 1)
                        {
                            msg.message = "[Server] : Game ended! X wins ";
                        }
                        else
                        {
                            msg.message = "[Server] : Game ended! 0 wins ";
                            
                        }

                        Console.WriteLine($"{msg.message}");
                        currentWriter.Write(JsonSerializer.Serialize(msg));
                        otherWriter.Write(JsonSerializer.Serialize(msg));
                        listener.Stop();
                        break;
                    }
                }

                if (i <= 2) // проверка по вертикали 
                {
                    if (msg.gameField[i] == msg.gameField[i + 3] && msg.gameField[i] == msg.gameField[i + 6])
                    {
                        if (msg.gameField[i] == 1)
                        {
                            msg.message = "[Server] : Game ended! X wins ";
                        }
                        else
                        {
                            msg.message = "[Server] : Game ended! 0 wins ";
                            
                        }

                        Console.WriteLine($"{msg.message}");
                        currentWriter.Write(JsonSerializer.Serialize(msg));
                        otherWriter.Write(JsonSerializer.Serialize(msg));
                        listener.Stop();
                        break;
                    }
                }

                if (i == 0 || i == 2)
                {
                    if (msg.gameField[i] == msg.gameField[4] && msg.gameField[i] == msg.gameField[8] ||
                        msg.gameField[i] == msg.gameField[4] && msg.gameField[i] == msg.gameField[6])
                    {
                        if (msg.gameField[i] == 1)
                        {
                            msg.message = "[Server] : Game ended! X wins ";
                        }
                        else
                        {
                            msg.message = "[Server] : Game ended! 0 wins ";
                            
                        }

                        Console.WriteLine($"{msg.message}");
                        currentWriter.Write(JsonSerializer.Serialize(msg));
                        otherWriter.Write(JsonSerializer.Serialize(msg));
                        listener.Stop();
                        break;
                    }
                }
            }
        }
        
        if (msg.message == "[Server] : Game ended!")
        {
            break;
        }

        
            
        Console.WriteLine($"[Player {activePlayer + 1}]  has made his move");


        game = msg!;

        activePlayer = activePlayer == 0 ? 1 : 0;

        game.currentPlayer = activePlayer;
        game.move++;
        otherWriter.Write(JsonSerializer.Serialize(game));
        otherWriter.Flush();

    }
    catch (Exception ex)
    {
        throw ex;
        break;
    }
    
}