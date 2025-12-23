FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["TherapyNotes.API/TherapyNotes.API.csproj", "TherapyNotes.API/"]
COPY ["TherapyNotes.Core/TherapyNotes.Core.csproj", "TherapyNotes.Core/"]
COPY ["TherapyNotes.Infrastructure/TherapyNotes.Infrastructure.csproj", "TherapyNotes.Infrastructure/"]

RUN dotnet restore "TherapyNotes.API/TherapyNotes.API.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/TherapyNotes.API"
RUN dotnet build "TherapyNotes.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TherapyNotes.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TherapyNotes.API.dll"]

