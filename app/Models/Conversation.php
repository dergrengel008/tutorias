<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['student_user_id', 'tutor_user_id', 'last_message_at'];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_user_id');
    }

    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_user_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function lastMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function otherParticipant($userId)
    {
        return $this->student_user_id === $userId ? $this->tutor : $this->student;
    }

    public function unreadCount($userId)
    {
        return $this->messages()->where('sender_user_id', '!=', $userId)->where('is_read', false)->count();
    }
}
