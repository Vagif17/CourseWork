FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["../TextMe.slnx", "./"]
COPY ["../API/API.csproj", "API/"]
COPY ["../Application/Application.csproj", "Application/"]
COPY ["../Infrastructure/Infrastructure.csproj", "Infrastructure/"]
COPY ["../Domain/Domain.csproj", "Domain/"]

RUN dotnet restore "TextMe.slnx"

COPY ../.. .

WORKDIR "/src/API"

RUN dotnet publish "API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "API.dll"]
