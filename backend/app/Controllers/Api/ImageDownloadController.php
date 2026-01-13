<?php namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\AlbumModel;
use App\Models\AlbumImageModel;
use App\Models\AlbumAuthTokenModel;
use CodeIgniter\API\ResponseTrait;

class ImageDownloadController extends BaseController
{
    use ResponseTrait;

    public function download($imageId = null)
    {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");

        if (!$imageId) {
            return $this->failNotFound('Image ID required');
        }

        $albumImageModel = new AlbumImageModel();
        $albumModel = new AlbumModel();
        $authTokenModel = new AlbumAuthTokenModel();

        // Get image details
        $image = $albumImageModel->find($imageId);
        if (!$image) {
            return $this->failNotFound('Image not found');
        }

        // Get album details
        $album = $albumModel->find($image['album_id']);
        if (!$album) {
            return $this->failNotFound('Album not found');
        }

        // Check if album is locked and validate token
        if ((int)$album['is_locked'] === 1) {
            $token = $this->request->getGet('token') ?: 
                     str_replace('Bearer ', '', $this->request->getHeaderLine('Authorization'));

            if (!$this->isTokenValid($album['id'], $token, $authTokenModel)) {
                return $this->respond([
                    'success' => false,
                    'error' => 'Authentication required or token expired'
                ], 401);
            }
        }

        $quality = $this->request->getGet('quality') ?: 'normal';
        $imagePath = FCPATH . $image['file_url'];

        if (!file_exists($imagePath)) {
            return $this->failNotFound('Image file not found');
        }

        try {
            // Get image info
            $imageInfo = getimagesize($imagePath);
            if (!$imageInfo) {
                return $this->fail('Invalid image file');
            }

            // Create image resource based on type
            switch ($imageInfo['mime']) {
                case 'image/jpeg':
                    $sourceImage = imagecreatefromjpeg($imagePath);
                    break;
                case 'image/png':
                    $sourceImage = imagecreatefrompng($imagePath);
                    break;
                case 'image/gif':
                    $sourceImage = imagecreatefromgif($imagePath);
                    break;
                default:
                    return $this->fail('Unsupported image format');
            }

            if (!$sourceImage) {
                return $this->fail('Failed to process image');
            }

            $originalWidth = imagesx($sourceImage);
            $originalHeight = imagesy($sourceImage);

            // Determine output dimensions
            if ($quality === 'normal') {
                $newWidth = (int)($originalWidth * 0.5);
                $newHeight = (int)($originalHeight * 0.5);
                $jpegQuality = 75;
            } else {
                $newWidth = $originalWidth;
                $newHeight = $originalHeight;
                $jpegQuality = 95;
            }

            // Create output image
            $outputImage = imagecreatetruecolor($newWidth, $newHeight);
            
            // Handle transparency for PNG
            if ($imageInfo['mime'] === 'image/png') {
                imagealphablending($outputImage, false);
                imagesavealpha($outputImage, true);
                $transparent = imagecolorallocatealpha($outputImage, 255, 255, 255, 127);
                imagefill($outputImage, 0, 0, $transparent);
            }

            // Resize image
            imagecopyresampled($outputImage, $sourceImage, 0, 0, 0, 0, 
                             $newWidth, $newHeight, $originalWidth, $originalHeight);

            // Add watermark
            $this->addWatermark($outputImage, $newWidth, $newHeight);

            // Set headers
            $filename = pathinfo($image['filename'], PATHINFO_FILENAME) . 
                       ($quality === 'normal' ? '_compressed' : '_hd') . '.jpg';
            
            header('Content-Type: image/jpeg');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Cache-Control: no-cache, must-revalidate');

            // Output image
            imagejpeg($outputImage, null, $jpegQuality);

            // Clean up
            imagedestroy($sourceImage);
            imagedestroy($outputImage);
            exit;

        } catch (\Exception $e) {
            log_message('error', 'Image download error: ' . $e->getMessage());
            return $this->fail('Failed to process image download');
        }
    }

    private function addWatermark($image, $width, $height)
    {
        $watermarkText = '©rashmiphotography';
        $fontColor = imagecolorallocatealpha($image, 255, 255, 255, 50);
        
        // Use built-in font
        $fontSize = 5;
        $textWidth = strlen($watermarkText) * imagefontwidth($fontSize);
        $textHeight = imagefontheight($fontSize);
        
        $x = $width - $textWidth - 20;
        $y = $height - $textHeight - 20;

        // Add background
        $bgColor = imagecolorallocatealpha($image, 0, 0, 0, 80);
        imagefilledrectangle($image, $x - 5, $y - 5, 
                           $x + $textWidth + 5, $y + $textHeight + 5, $bgColor);

        // Add text
        imagestring($image, $fontSize, $x, $y, $watermarkText, $fontColor);
    }

    private function isTokenValid($albumId, $token, $authTokenModel)
    {
        if (!$token) {
            return false;
        }

        $currentTime = date('Y-m-d H:i:s');
        $authTokenModel->where('expires_at <=', $currentTime)->delete();

        $row = $authTokenModel
            ->where('album_id', $albumId)
            ->where('token', $token)
            ->first();

        return $row !== null;
    }
}