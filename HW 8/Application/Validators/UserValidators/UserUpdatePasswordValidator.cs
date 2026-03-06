using FluentValidation;
using Application.DTOs;

namespace Application.Validators.UserValidators;

public class UserUpdatePasswordValidator : AbstractValidator<UpdatePasswordRequest>
{
    public UserUpdatePasswordValidator()
    {
        RuleFor(x => x.Password)
           .NotEmpty().WithMessage("Password is required.")
           .MinimumLength(6).WithMessage("Password must be at least 6 characters long.")
           .MaximumLength(100).WithMessage("Password cannot exceed 100 characters.");

        RuleFor(x => x.NewPassword)
           .NotEmpty().WithMessage("New Password required")
           .MinimumLength(6).WithMessage("Password must be at least 6 characters long.")
           .MaximumLength(100).WithMessage("Password cannot exceed 100 characters.");
    }
}
