/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 */

package com.mycompany.saballa;

import Concrete.MyCar;
import Concrete.MyMotorcycle;
import Concrete.Race;

/**
 *
 * @author User
 */
public class App {

    public static void main(String[] args) {
     
        MyCar Supra = new MyCar();
        Supra.Start();
        Supra.horsePower = 200;
        
        MyMotorcycle ZX10R = new MyMotorcycle();
        ZX10R.Start();
        ZX10R.horsePower = 215;
        
        Race Racing = new Race();
        
        Racing.Race(Supra.horsePower, ZX10R.horsePower);
       
    }
}
