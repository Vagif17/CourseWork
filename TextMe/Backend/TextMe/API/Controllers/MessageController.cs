using Application.DTOs;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        private readonly IMessageService _messageService;
        private readonly ICloudinaryService _cloudinaryService;

        public MessageController(IMessageService messageService, ICloudinaryService cloudinaryService)
        {
            _messageService = messageService;
            _cloudinaryService = cloudinaryService;
        }

        [HttpGet("{chatId}")]
        public async Task<IActionResult> GetChatMessages(int chatId)
        {
            var messages = await _messageService.GetChatMessagesAsync(chatId);
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

                var url = await _cloudinaryService.UploadMediaAsync(dto);
                urls.Add(url);
            }

            return Ok(urls); 
        }
    }
}