<?php

namespace App\Helpers;

class QRCodeHelper
{
    /**
     * Generate QR code image and return as PNG
     */
    public static function generateQRCode($text, $size = 300)
    {
        // Using a simple QR code generation via external API with margin (padding)
        $encodedText = urlencode($text);
        $qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size={$size}x{$size}&margin=20&data={$encodedText}";
        
        $qrImage = @file_get_contents($qrUrl);
        
        if ($qrImage === false) {
            throw new \Exception('Failed to generate QR code');
        }
        
        return $qrImage;
    }
}
