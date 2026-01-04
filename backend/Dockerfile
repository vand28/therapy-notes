FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["Regulie.API/Regulie.API.csproj", "Regulie.API/"]
COPY ["Regulie.Core/Regulie.Core.csproj", "Regulie.Core/"]
COPY ["Regulie.Infrastructure/Regulie.Infrastructure.csproj", "Regulie.Infrastructure/"]

RUN dotnet restore "Regulie.API/Regulie.API.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/Regulie.API"
RUN dotnet build "Regulie.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Regulie.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Regulie.API.dll"]

