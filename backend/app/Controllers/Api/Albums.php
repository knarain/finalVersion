<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\AlbumModel;
use App\Models\AlbumImageModel;
use App\Models\AlbumAuthCredentialModel;
use App\Models\AlbumAuthTokenModel;
use App\Models\CategoryModel;
use App\Libraries\Utils;
use CodeIgniter\HTTP\ResponseInterface;

class Albums extends BaseController
{
    protected AlbumModel $albumModel;
    protected AlbumImageModel $imageModel;
    protected AlbumAuthCredentialModel $credModel;
    protected AlbumAuthTokenModel $tokenModel;

    protected CategoryModel $categoryModel;

    public function __construct()
    {
        $this->albumModel = new AlbumModel();
        $this->imageModel = new AlbumImageModel();
        $this->credModel  = new AlbumAuthCredentialModel();
        $this->tokenModel = new AlbumAuthTokenModel();
        $this->categoryModel = new CategoryModel();
    }

    public function byCategory($categoryId = null)
    {
        if (!$categoryId) {
            return Utils::formatApiResponse(
                null,
                'Category ID required',
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        $category = $this->categoryModel->find($categoryId);
        if (!$category) {
            return Utils::formatApiResponse(
                null,
                'Category not found',
                ResponseInterface::HTTP_NOT_FOUND
            );
        }

        $page = (int) ($this->request->getGet('page') ?? 1);
        $pageSize = (int) ($this->request->getGet('page_size') ?? 10);

        $result = Utils::getPaginationData(
            $this->albumModel,
            ['category_id' => $categoryId, 'is_active' => 1],
            $page,
            $pageSize,
            ['created_at' => 'DESC']
        );

        $data = array_map(fn ($a) => [
            'id'          => (int) $a['id'],
            'clientNames' => $a['client_names'],
            'albumCode'   => $a['album_code'],
            'eventDate'   => $a['event_date'],
            'coverImage'  => $a['cover_image'],
            'isLocked'    => (bool) $a['is_locked'],
        ], $result['data']);

        return Utils::formatApiResponse(
            [
                'category' => [
                    'id' => (int) $category['id'],
                    'name' => $category['name']
                ],
                'albums' => $data,
                'pagination' => $result['pagination']
            ],
            'Albums fetched successfully'
        );
    }

    public function images($id = null)
    {
        if (!$id) {
            return Utils::formatApiResponse(
                null,
                'Album id required',
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        $album = $this->albumModel->find($id);
        if (!$album) {
            return Utils::formatApiResponse(
                null,
                'Album not found',
                ResponseInterface::HTTP_NOT_FOUND
            );
        }

        if ((int) $album['is_locked'] === 1) {
            $tokenData = Utils::getAuthenticatedUser(
                $this->request,
                $this->tokenModel,
                ['album_id' => $id]
            );

            if ($tokenData === null) {
                return Utils::formatApiResponse(
                    null,
                    'Album is locked. Authentication required.',
                    ResponseInterface::HTTP_UNAUTHORIZED
                );
            }
        }

        $images = $this->imageModel
            ->where('album_id', $id)
            ->orderBy('id', 'ASC')
            ->findAll();

        $data = array_map(fn ($img) => [
            'id'       => (int) $img['id'],
            'albumId'  => (int) $img['album_id'],
            'fileName' => $img['filename'],
            'fileUrl'  => $img['file_url'],
            'caption'  => $img['caption'],
        ], $images);

        return Utils::formatApiResponse(
            $data,
            'Album images fetched successfully',
            ResponseInterface::HTTP_OK
        );
    }

    public function imagesByCode($code = null)
    {
        if (!$code) {
            return Utils::formatApiResponse(
                null,
                'Album code required',
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        $album = $this->albumModel->where('album_code', $code)->first();
        if (!$album) {
            return Utils::formatApiResponse(
                null,
                'Album not found',
                ResponseInterface::HTTP_NOT_FOUND
            );
        }

        if ((int) $album['is_locked'] === 1) {
            $authHeader = $this->request->getHeaderLine('Authorization');
            if (!$authHeader) {
                return Utils::formatApiResponse(
                    null,
                    'Album is locked. Token required.',
                    ResponseInterface::HTTP_UNAUTHORIZED
                );
            }

            $token = str_starts_with($authHeader, 'Bearer ') 
                ? substr($authHeader, 7) 
                : $authHeader;

            // Check for valid token
            $tokenData = $this->tokenModel
                ->where('token', $token)
                ->where('album_id', $album['id'])
                ->where('expires_at >', date('Y-m-d H:i:s'))
                ->first();

            if (!$tokenData) {
                return Utils::formatApiResponse(
                    null,
                    'Invalid or expired token',
                    ResponseInterface::HTTP_UNAUTHORIZED
                );
            }
        }

        $images = $this->imageModel
            ->where('album_id', $album['id'])
            ->orderBy('id', 'ASC')
            ->findAll();

        $data = array_map(fn ($img) => [
            'id'       => (int) $img['id'],
            'fileName' => $img['filename'],
            'fileUrl'  => $img['file_url'],
            'caption'  => $img['caption'],
        ], $images);

        return Utils::formatApiResponse(
            $data,
            'Album images fetched successfully'
        );
    }

    public function authenticateByCode($code = null)
    {
        if (!$code) {
            return Utils::formatApiResponse(
                null,
                'Album code required',
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        $album = $this->albumModel->where('album_code', $code)->first();
        if (!$album) {
            return Utils::formatApiResponse(
                null,
                'Album not found',
                ResponseInterface::HTTP_NOT_FOUND
            );
        }

        $json = $this->request->getJSON(true);
        $email = $json['email'] ?? null;
        $password = $json['password'] ?? null;
        $captchaId = $json['captcha_id'] ?? null;
        $captchaText = $json['captcha_text'] ?? null;

        if (!$email || !$password || !$captchaId || !$captchaText) {
            return Utils::formatApiResponse(
                null,
                'Email, password, captcha_id, and captcha_text are required',
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        // 🧠 CAPTCHA Validation
        $captcha = Utils::verifyCaptcha($captchaId, $captchaText);
        if ($captcha !== true) {
            return Utils::formatApiResponse(
                null,
                $captcha,
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        $cred = $this->credModel
            ->where(['album_id' => $album['id'], 'email' => $email])
            ->first();

        if (!$cred || !password_verify($password, $cred['password_hash'])) {
            return Utils::formatApiResponse(
                null,
                'Invalid credentials',
                ResponseInterface::HTTP_UNAUTHORIZED
            );
        }

        $token = bin2hex(random_bytes(24));
        $expiresAt = date('Y-m-d H:i:s', time() + 6 * 3600);

        $this->tokenModel->insert([
            'album_id'   => $album['id'],
            'token'      => $token,
            'expires_at' => $expiresAt,
        ]);

        return Utils::formatApiResponse(
            [
                'token'     => $token,
                'expiresAt' => $expiresAt,
            ],
            'Authentication successful'
        );
    }
}
