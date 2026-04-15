using Application.Features.Messages.Commands;
using Application.Interfaces.Services;
using MediatR;
using Application.Interfaces.Notifications;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Infrastructure.Hubs;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatHub : Hub
{
    private readonly IMediator mediator;
    private readonly IUserPresenceManager userPresenceManager;
    private readonly IMessageRealtimeNotifier messageRealtimeNotifier;

    public ChatHub(
        IMediator mediator,
        IUserPresenceManager userPresenceManager,
        IMessageRealtimeNotifier messageRealtimeNotifier)
    {
        this.mediator = mediator;
        this.userPresenceManager = userPresenceManager;
        this.messageRealtimeNotifier = messageRealtimeNotifier;
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            await userPresenceManager.HandleUserConnectedAsync(userId, Context.ConnectionId);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            await userPresenceManager.HandleUserDisconnectedAsync(userId, Context.ConnectionId);
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinChat(int chatId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"chat-{chatId}");
    }

    public async Task LeaveChat(int chatId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat-{chatId}");
    }

    public async Task SendMessage(
        int chatId,
        string? text,
        string? mediaUrl,
        string? mediaType,
        int? audioDuration,
        int? replyToMessageId = null)
    {
        var userId = Context.UserIdentifier;
        if (userId == null) throw new HubException("Unauthorized");

        var message = await mediator.Send(new CreateMessageCommand(
            chatId, userId, text, mediaUrl, mediaType, audioDuration, replyToMessageId));

        await messageRealtimeNotifier.NotifyNewMessageAsync(chatId, message);
    }

    public async Task EditMessage(int messageId, string newText)
    {
        var userId = Context.UserIdentifier;
        if (userId == null) throw new HubException("Unauthorized");

        await mediator.Send(new EditMessageCommand(messageId, userId, newText));
    }

    public async Task DeleteMessage(int messageId)
    {
        var userId = Context.UserIdentifier;
        if (userId == null) throw new HubException("Unauthorized");

        await mediator.Send(new DeleteMessageCommand(messageId, userId));
    }

    public async Task CallUser(string targetUserId, object offer)
    {
        var callerId = Context.UserIdentifier;
        if (callerId == null) return;
        await messageRealtimeNotifier.NotifyIncomingCallAsync(targetUserId, callerId, offer);
    }

    public async Task AnswerCall(string targetUserId, object answer)
    {
        var answererId = Context.UserIdentifier;
        if (answererId == null) return;
        await messageRealtimeNotifier.NotifyCallAnsweredAsync(targetUserId, answererId, answer);
    }

    public async Task RejectCall(string targetUserId)
    {
        var rejecterId = Context.UserIdentifier;
        if (rejecterId == null) return;
        await messageRealtimeNotifier.NotifyCallRejectedAsync(targetUserId, rejecterId);
    }

    public async Task EndCall(string targetUserId)
    {
        var enderId = Context.UserIdentifier;
        if (enderId == null) return;
        await messageRealtimeNotifier.NotifyCallEndedAsync(targetUserId, enderId);
    }

    public async Task SendIceCandidate(string targetUserId, object candidate)
    {
        var senderId = Context.UserIdentifier;
        if (senderId == null) return;
        await messageRealtimeNotifier.NotifyIceCandidateAsync(targetUserId, senderId, candidate);
    }

    public async Task AckMessageDelivered(int messageId)
    {
        var userId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(userId)) throw new HubException("Unauthorized");

        await mediator.Send(new AckMessageDeliveredCommand(messageId, userId));
    }

    public async Task MarkChatAsRead(int chatId)
    {
        var userId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(userId)) throw new HubException("Unauthorized");

        await mediator.Send(new MarkChatAsReadCommand(chatId, userId));
    }
}
