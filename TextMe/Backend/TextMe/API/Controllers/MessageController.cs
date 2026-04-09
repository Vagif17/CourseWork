using Application.DTOs;
using Application.Features.Messages.Queries;
using Application.Services.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        private readonly IMediator mediator;
        private readonly ICloudinaryService cloudinaryService;

        public MessageController(IMediator _mediator, ICloudinaryService _cloudinaryService)
        {
            mediator = _mediator;
            cloudinaryService = _cloudinaryService;
        }

        [HttpGet("{chatId}")]
        public async Task<IActionResult> GetChatMessages(int chatId)
        {
            var messages = await mediator.Send(new GetMessagesQuery(chatId));
            return Ok(messages);
        }

        [HttpPost("upload-media")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadMedia([FromForm] List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
                return BadRequest("Files are required");

            var urls = new List<string>();

            foreach (var file in files)
            {
                using var stream = file.OpenReadStream();

                var dto = new UploadMediaRequestDTO
                {
                    FileName = file.FileName,
                    ContentType = file.ContentType,
                    FileStream = stream
                };

                var url = await cloudinaryService.UploadMediaAsync(dto);
                urls.Add(url);
            }

            return Ok(urls); 
        }
    }
}