/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Concrete;

import Abstract.iCar;

/**
 *
 * @author User
 */
public class MyMotorcycle implements iCar{
    public int horsePower;
    
     @Override
    public void Start() {
        System.out.println("RETITITIIT VROOOOOOOOOOOOOOOOOMMMMMMMMMMMMMMM\n");
    }

    @Override
    public void Stop() {
        System.out.println("Your motorcycle is stopping");   
    }
    
   
}

