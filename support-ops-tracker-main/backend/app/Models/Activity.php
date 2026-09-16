<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = ['name', 'description', 'created_by', 'is_active'];

    public function updates()
    {
        return $this->hasMany(ActivityUpdate::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}