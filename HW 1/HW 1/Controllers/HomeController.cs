using System.Diagnostics;
using HW_1.Models;
using HW_1.Services.Classes;
using Microsoft.AspNetCore.Mvc;

namespace HW_1.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ISendMessage _sendMessage;

        public HomeController(ILogger<HomeController> logger,ISendMessage sendMessage)
        {
            _logger = logger;
            _sendMessage = sendMessage;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult AboutMe()
        {
            return View();
        }

        public IActionResult Gallery()
        {
            return View();
        }


        [HttpGet]
        public IActionResult ContactMe()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage([Bind("Email,Text")] ContactViewModel contact)
        {
            if (!string.IsNullOrEmpty(contact.Email) && !string.IsNullOrEmpty(contact.Text))
            {
                 await _sendMessage.SendEmailAsync(contact.Email, contact.Text);
            }
            return RedirectToAction(nameof(ContactMe));
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
