<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('tokens_requested');
            $table->decimal('amount_paid', 12, 2)->comment('Monto pagado en Bs o USD');
            $table->string('currency', 10)->default('USD')->comment('USD o VES');
            $table->string('bank_name')->nullable()->comment('Banco emisor del pago movil');
            $table->string('phone_number')->nullable()->comment('Numero de telefono del pago movil');
            $table->string('reference_number')->nullable()->comment('Numero de referencia del pago movil');
            $table->string('receipt_image_path')->nullable()->comment('Captura del comprobante de pago');
            $table->string('status', 20)->default('pending');
            $table->text('admin_notes')->nullable()->comment('Notas del administrador al aprobar/rechazar');
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_receipts');
    }
};
