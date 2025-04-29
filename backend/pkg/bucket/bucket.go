package bucket

import (
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"
)

type S3Uploader struct {
	Client     *s3.Client
	Uploader   *manager.Uploader
	BucketName string
}

func NewUploader() (*S3Uploader, error) {
	region := os.Getenv("AWS_REGION")
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(region))
	if err != nil {
		return nil, err
	}
	bucket := os.Getenv("S3_BUCKET_NAME")

	client := s3.NewFromConfig(cfg)
	uploader := manager.NewUploader(client)

	return &S3Uploader{
		Client:     client,
		Uploader:   uploader,
		BucketName: bucket,
	}, nil
}

func (s *S3Uploader) UploadFile(file multipart.File, fileHeader *multipart.FileHeader, folder string) (string, error) {
	defer file.Close()

	ext := filepath.Ext(fileHeader.Filename)
	key := fmt.Sprintf("%s/%d%s", folder, time.Now().UnixNano(), ext)

	result, err := s.Uploader.Upload(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(s.BucketName),
		Key:    aws.String(key),
		Body:   file,
	})
	if err != nil {
		return "", err
	}

	return result.Location, nil
}
