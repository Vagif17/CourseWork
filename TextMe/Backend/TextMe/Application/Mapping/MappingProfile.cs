using AutoMapper;
using Application.DTOs;
using Domain;

namespace Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {

        #region ChatMapping

        CreateMap<ChatParticipant, ParticipantDTO>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId));

        CreateMap<Chat, PrivateChatResponseDTO>()
            .ForMember(dest => dest.Participants, opt => opt.MapFrom(src => src.Participants));

        #endregion

        #region MessageMapping 

        CreateMap<Message, MessageDTO>()
            .ForMember(dest => dest.SenderId, opt => opt.MapFrom(src => src.SenderId));


        #endregion
    }
}