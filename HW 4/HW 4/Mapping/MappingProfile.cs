namespace HW_4.Mapping;
using AutoMapper;
using HW_4.DTO_s;
using HW_4.Models;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        #region Customer 

        CreateMap<CreateCustomerRequestDTO, Customer>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow));

        CreateMap<Customer, CustomerResponseDTO>();

        CreateMap<UpdateCustomerRequestDTO, Customer>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
            .ForMember(dest => dest.DeletedAt, opt => opt.Ignore());
        #endregion

        #region Invoice

        CreateMap<CreateInvoiceRequestDTO, Invoice>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => InvoiceStatus.Created));
        CreateMap<Invoice, InvoiceResponseDTO>();

        CreateMap<UpdateInvoiceRequestDTO, Invoice>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTimeOffset.UtcNow))
            .ForMember(dest => dest.DeletedAt, opt => opt.Ignore());

        #endregion

        #region InvoiceRow

        CreateMap<CreateInvoiceRowRequestDTO, InvoiceRow>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Sum, opt => opt.MapFrom(src => src.Quantity * src.Rate));
        
        CreateMap<InvoiceRow, InvoiceRowResponseDTO>();

        CreateMap<UpdateInvoiceRowRequestDTO, InvoiceRow>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.InvoiceId, opt => opt.Ignore())
            .ForMember(dest => dest.Sum, opt => opt.MapFrom(src => src.Quantity * src.Rate));
        #endregion
    }
}
