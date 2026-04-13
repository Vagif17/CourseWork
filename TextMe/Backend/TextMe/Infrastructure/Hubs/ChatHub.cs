using System.Security.Claims;
using Application.DTOs;
using Application.Features.Messages.Commands;
using Application.Helpers;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain;
using Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;

namespace Infrastructure.Hubs;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatHub : Hub
{
    private readonly IMediator mediator;
    private readonly IUserPresenceService presenceService;
    private readonly UserManager<AppUser> userManager;
    private readonly IChatRepository chatRepository;
    private readonly IMessageRepository messageRepository;

    public ChatHub(
        IMediator mediator,
        IUserPresenceService presenceService,
        UserManager<AppUser> userManager,
        IChatRepository chatRepository,
        IMessageRepository messageRepository)
    {
        this.mediator = mediator;
        this.presenceService = presenceService;
        this.userManager = userManager;
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        var userId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(userId))
            return;

        presenceService.RegisterConnection(userId, Context.ConnectionId);

        var user = await userManager.FindByIdAsync(userId);
        if (user?.ShareOnlineStatus != true)
            return;

        var partners = await chatRepository.GetDistinctPrivateChatPartnerIdsAsync(userId);
        if (partners.Count == 0)
            return;

        await Clients.Users(partners.ToArray()).SendAsync(
            "UserPresenceUpdated",
            new UserPresenceSocketDto
            {
                UserId = userId,
                PresenceHidden = false,
                IsOnline = true,
                LastSeenAt = null
            });
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            presenceService.UnregisterConnection(userId, Context.ConnectionId);
            if (!presenceService.IsOnline(userId))
            {
                var user = await userManager.FindByIdAsync(userId);
                if (user != null)
                {
                    var now = DateTimeOffset.UtcNow;
                    user.LastSeenAt = now;
                    user.UpdatedAt = now;
                    await userManager.UpdateAsync(user);
                }

                user = await userManager.FindByIdAsync(userId);
                if (user?.ShareOnlineStatus == true)
                {
                    var partners = await chatRepository.GetDistinctPrivateChatPartnerIdsAsync(userId);
                    if (partners.Count > 0)
                    {
                        await Clients.Users(partners.ToArray()).SendAsync(
                            "UserPresenceUpdated",
                            new UserPresenceSocketDto
                            {
                                UserId = userId,
                                PresenceHidden = false,
                                IsOnline = false,
                                LastSeenAt = user.LastSeenAt
                            });
                    }
                }
            }
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
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            throw new HubException("Unauthorized");

        var message = await mediator.Send(new CreateMessageCommand(
            chatId,
            userId,
            text,
            mediaUrl,
            mediaType,
            audioDuration,
            replyToMessageId
        ));

        await Clients.Group($"chat-{chatId}")
            .SendAsync("ReceiveMessage", message);

        var preview = MessagePreviewFormatter.ToPreview(message.Text, message.MediaUrl, message.MediaType);
        var previewDto = new ChatListPreviewDto
        {
            ChatId = chatId,
            LastMessage = preview,
            LastMessageAt = message.CreatedAt
        };
        var participants = await chatRepository.GetChatParticipantIdsAsync(chatId);
        await Clients.Users(participants.ToArray()).SendAsync("ChatListUpdated", previewDto);
    }

    public async Task EditMessage(int messageId, string newText)
    {
        var userId = Context.UserIdentifier;
        if (userId == null) throw new HubException("Unauthorized");

        var updatedMsg = await mediator.Send(new EditMessageCommand(messageId, userId, newText));
        
        await Clients.Group($"chat-{updatedMsg.ChatId}")
            .SendAsync("MessageEdited", updatedMsg);
    }

    public async Task DeleteMessage(int messageId)
    {
        var userId = Context.UserIdentifier;
        if (userId == null) throw new HubException("Unauthorized");

        var msg = await messageRepository.GetByIdTrackingAsync(messageId);
        if (msg == null) return;

        var success = await mediator.Send(new DeleteMessageCommand(messageId, userId));
        
        if (success)
        {
            await Clients.Group($"chat-{msg.ChatId}")
                .SendAsync("MessageDeleted", new { MessageId = messageId, ChatId = msg.ChatId });
        }
    }

    public async Task CallUser(string targetUserId, object offer)
    {
        var callerId = Context.UserIdentifier;
        if (callerId == null) return;
        await Clients.User(targetUserId).SendAsync("IncomingCall", new { CallerId = callerId, Offer = offer });
    }

    public async Task AnswerCall(string targetUserId, object answer)
    {
        var answererId = Context.UserIdentifier;
        if (answererId == null) return;
        await Clients.User(targetUserId).SendAsync("CallAnswered", new { AnswererId = answererId, Answer = answer });
    }

    public async Task RejectCall(string targetUserId)
    {
        var rejecterId = Context.UserIdentifier;
        if (rejecterId == null) return;
        await Clients.User(targetUserId).SendAsync("CallRejected", new { RejecterId = rejecterId });
    }

    public async Task EndCall(string targetUserId)
    {
        var enderId = Context.UserIdentifier;
        if (enderId == null) return;
        await Clients.User(targetUserId).SendAsync("CallEnded", new { EnderId = enderId });
    }

    public async Task SendIceCandidate(string targetUserId, object candidate)
    {
        var senderId = Context.UserIdentifier;
        if (senderId == null) return;
        await Clients.User(targetUserId).SendAsync("ReceiveIceCandidate", new { SenderId = senderId, Candidate = candidate });
    }

    public async Task AckMessageDelivered(int messageId)
    {
        var userId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(userId))
            throw new HubException("Unauthorized");

        var msg = await messageRepository.GetByIdTrackingAsync(messageId);
        if (msg == null || msg.SenderId == userId)
            return;
        if (!await chatRepository.IsUserParticipantInChatAsync(msg.ChatId, userId))
            return;
        if (msg.Status != MessageStatus.Sent)
            return;

        msg.Status = MessageStatus.Delivered;
        await messageRepository.UpdateMessageAsync(msg);

        await Clients.User(msg.SenderId).SendAsync(
            "MessageStatusUpdated",
            new MessageStatusSocketDto
            {
                MessageId = msg.Id,
                ChatId = msg.ChatId,
                Status = MessageStatus.Delivered.ToString()
            });
    }

    public async Task MarkChatAsRead(int chatId)
    {
        var userId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(userId))
            throw new HubException("Unauthorized");

        if (!await chatRepository.IsUserParticipantInChatAsync(chatId, userId))
            throw new HubException("Forbidden");

        var read = await messageRepository.MarkIncomingAsReadAsync(chatId, userId);
        foreach (var (messageId, senderId) in read)
        {
            await Clients.User(senderId).SendAsync(
                "MessageStatusUpdated",
                new MessageStatusSocketDto
                {
                    MessageId = messageId,
                    ChatId = chatId,
                    Status = MessageStatus.Read.ToString()
                });
        }
    }
}
