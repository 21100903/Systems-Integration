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
public class MyCar implements iCar {

    public int horsePower;
    
    
    @Override
    public void Start() {
        System.out.println("*STARTING* *BACKFIRE* VROOOOMMMMM *BACKFIRE*\n");
    }

    @Override
    public void Stop() {
        System.out.println("Your car is stopping");   
    }
    
}
    
    
