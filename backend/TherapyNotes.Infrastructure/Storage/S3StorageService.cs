using Amazon.S3;
using Amazon.S3.Model;
using TherapyNotes.Core.Interfaces;

namespace TherapyNotes.Infrastructure.Storage;

public class S3StorageService : IStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;

    public S3StorageService(string endpoint, string accessKey, string secretKey, string bucketName, string region)
    {
        var config = new AmazonS3Config
        {
            ServiceURL = endpoint,
            ForcePathStyle = true
        };

        if (!string.IsNullOrEmpty(region) && region != "auto")
        {
            config.AuthenticationRegion = region;
        }

        _s3Client = new AmazonS3Client(accessKey, secretKey, config);
        _bucketName = bucketName;
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        var fileKey = $"{Guid.NewGuid()}_{fileName}";

        var putRequest = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = fileKey,
            InputStream = fileStream,
            ContentType = contentType
        };

        await _s3Client.PutObjectAsync(putRequest);

        return fileKey;
    }

    public async Task<Stream> DownloadFileAsync(string fileKey)
    {
        var getRequest = new GetObjectRequest
        {
            BucketName = _bucketName,
            Key = fileKey
        };

        var response = await _s3Client.GetObjectAsync(getRequest);
        return response.ResponseStream;
    }

    public async Task<bool> DeleteFileAsync(string fileKey)
    {
        try
        {
            var deleteRequest = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = fileKey
            };

            await _s3Client.DeleteObjectAsync(deleteRequest);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<string> GetPresignedUrlAsync(string fileKey, int expirationMinutes = 60)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = fileKey,
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes)
        };

        return await Task.FromResult(_s3Client.GetPreSignedURL(request));
    }
}

