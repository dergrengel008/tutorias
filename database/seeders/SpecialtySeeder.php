<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Specialty;

class SpecialtySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $specialties = [
            ['name' => 'Matemáticas',   'description' => 'Álgebra, cálculo, geometría, estadística y todas las ramas de las matemáticas.',             'icon' => 'calculator'],
            ['name' => 'Física',        'description' => 'Mecánica, termodinámica, electromagnetismo, óptica y física moderna.',                      'icon' => 'atom'],
            ['name' => 'Química',       'description' => 'Química orgánica, inorgánica, analítica, bioquímica y fisicoquímica.',                      'icon' => 'flask'],
            ['name' => 'Biología',      'description' => 'Biología celular, genética, ecología, anatomía, fisiología y microbiología.',                 'icon' => 'leaf'],
            ['name' => 'Programación',  'description' => 'Desarrollo web, mobile, algoritmos, bases de datos, inteligencia artificial y más.',           'icon' => 'code'],
            ['name' => 'Inglés',        'description' => 'Gramática, conversación, escritura académica, preparación de exámenes (TOEFL, IELTS).',     'icon' => 'globe'],
            ['name' => 'Francés',       'description' => 'Gramática, conversación, literatura francesa, preparación DELF/DALF.',                       'icon' => 'languages'],
            ['name' => 'Historia',      'description' => 'Historia universal, historia contemporánea, historia de América, historia del arte.',         'icon' => 'book-open'],
            ['name' => 'Geografía',     'description' => 'Geografía física, humana, económica, geopolítica y cartografía.',                           'icon' => 'map'],
            ['name' => 'Filosofía',     'description' => 'Ética, lógica, metafísica, filosofía política, estética y filosofía de la ciencia.',         'icon' => 'brain'],
            ['name' => 'Economía',      'description' => 'Microeconomía, macroeconomía, econometría, política económica y finanzas.',                  'icon' => 'trending-up'],
            ['name' => 'Contabilidad',  'description' => 'Contabilidad financiera, de costos, gerencial, auditoría y tributaria.',                    'icon' => 'file-text'],
            ['name' => 'Derecho',       'description' => 'Derecho civil, penal, laboral, mercantil, constitucional e internacional.',                  'icon' => 'scale'],
            ['name' => 'Medicina',      'description' => 'Anatomía, fisiología, farmacología, patología, clínica y especialidades médicas.',           'icon' => 'heart-pulse'],
            ['name' => 'Ingeniería',    'description' => 'Ingeniería civil, electrónica, industrial, mecánica, de sistemas y ambiental.',              'icon' => 'wrench'],
        ];

        foreach ($specialties as $specialty) {
            Specialty::firstOrCreate(
                ['name' => $specialty['name']],
                [
                    'description' => $specialty['description'],
                    'icon' => $specialty['icon'],
                ]
            );
        }
    }
}
