using AutoMapper;
using TextMe.DTO_S;
using TextMe.DTOs;
using TextMe.Models;

namespace TextMe.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {

        #region UserMapping

        CreateMap<RegisterRequestDTO, AppUser>()
            .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.Avatar))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
            .ForMember(dest => dest.ChatParticipants, opt => opt.Ignore()) 
            .ForMember(dest => dest.Id, opt => opt.Ignore()) 
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());

        CreateMap<AppUser, AuthResponseDTO>()
            .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.AvatarUrl ?? string.Empty))
            .ForMember(dest => dest.Roles, opt => opt.Ignore());

        #endregion

        #region ChatMapping

        CreateMap<ChatParticipant, ParticipantDTO>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName)) 
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.User.AvatarUrl));

        CreateMap<Chat, PrivateChatDTOResponse>()
            .ForMember(dest => dest.Participants, opt => opt.MapFrom(src => src.Participants));


        #endregion


        #region MessageMapping 

        CreateMap<Message, MessageDTO>()
            .ForMember(dest => dest.SenderId, opt => opt.MapFrom(src => src.SenderId))
            .ForMember(dest => dest.SenderUserName,
                opt => opt.MapFrom(src => src.Sender.UserName))
            .ForMember(dest => dest.SenderAvatarUrl,
                opt => opt.MapFrom(src => src.Sender.AvatarUrl));

        #endregion
    }
}